import { Cell, ICellModel } from '@jupyterlab/cells';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { NotebookPanel } from '@jupyterlab/notebook';
import {
  IObservableList,
  IObservableUndoableList,
  ObservableList
} from '@jupyterlab/observables';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import {
  addIcon,
  caretDownEmptyThinIcon,
  caretUpEmptyThinIcon,
  markdownIcon,
  runIcon
} from '@jupyterlab/ui-components';
import { CommandRegistry } from '@lumino/commands';
import { IDisposable } from '@lumino/disposable';
import { PanelLayout, Widget } from '@lumino/widgets';
import { CellToolbarWidget, LEFT_SPACER_CLASSNAME } from './celltoolbarwidget';
import { codeIcon, deleteIcon, formatIcon } from './icon';
import { PositionedButton } from './positionedbutton';
import { ICellMenuItem } from './tokens';

const DEFAULT_LEFT_MENU: ICellMenuItem[] = [
  // Originate from @jupyterlab/notebook-extension
  {
    cellType: 'markdown',
    command: 'notebook:change-cell-to-code',
    icon: codeIcon
  },
  {
    cellType: 'code',
    command: 'notebook:change-cell-to-markdown',
    icon: markdownIcon
  },
  // Originate from @ryantam626/jupyterlab_code_formatter
  {
    cellType: 'code',
    command: 'jupyterlab_code_formatter:format',
    icon: formatIcon,
    tooltip: 'Format Cell'
  },
  // Originate from @jupyterlab/notebook-extension
  {
    command: 'notebook:delete-cell',
    icon: deleteIcon
  }
];

const POSITIONED_BUTTONS: ICellMenuItem[] = [
  // Originate from @jupyterlab/notebook-extension
  {
    command: 'notebook:run-cell-and-select-next',
    icon: runIcon
  },
  {
    command: 'notebook:move-cell-up',
    icon: caretUpEmptyThinIcon
  },
  {
    command: 'notebook:move-cell-down',
    icon: caretDownEmptyThinIcon
  },
  {
    command: 'notebook:insert-cell-below',
    icon: addIcon
  }
];

/**
 * Widget cell toolbar class
 */
const CELL_BAR_CLASS = 'jp-enh-cell-bar';

/**
 * Watch a notebook, and each time a cell is created add a CellTagsWidget to it.
 */
export class CellToolbarTracker implements IDisposable {
  constructor(
    panel: NotebookPanel,
    commands: CommandRegistry,
    settings: ISettingRegistry.ISettings | null
  ) {
    this._commands = commands;
    this._panel = panel;
    this._settings = settings;

    if (this._settings) {
      this._onSettingsChanged();
      this._settings.changed.connect(this._onSettingsChanged, this);
    }

    const cells = this._panel.context.model.cells;
    cells.changed.connect(this.updateConnectedCells, this);
  }

  get isDisposed(): boolean {
    return this._isDisposed;
  }

  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._isDisposed = true;

    if (this._settings) {
      this._settings.changed.disconnect(this._onSettingsChanged, this);
    }

    const cells = this._panel.context.model.cells;
    cells.changed.disconnect(this.updateConnectedCells, this);
    this._panel = null;
  }

  /**
   * Callback to react to cells list changes
   *
   * @param cells List of notebook cells
   * @param changed Modification of the list
   */
  updateConnectedCells(
    cells: IObservableUndoableList<ICellModel>,
    changed: IObservableList.IChangedArgs<ICellModel>
  ): void {
    changed.oldValues.forEach(model => this._removeToolbar(model));
    changed.newValues.forEach(model => this._addToolbar(model));
  }

  private _addToolbar(model: ICellModel): void {
    const cell = this._getCell(model);
    if (cell) {
      const toolbar = new CellToolbarWidget(
        this._commands,
        model,
        this._allTags,
        this._leftMenuItems,
        this._rightMenuItems,
        (this._settings?.composite['leftSpace'] as number) || 0
      );
      toolbar.addClass(CELL_BAR_CLASS);
      (cell.layout as PanelLayout).insertWidget(0, toolbar);

      POSITIONED_BUTTONS.forEach(entry => {
        if (this._commands.hasCommand(entry.command)) {
          const { cellType, command, tooltip, ...others } = entry;
          const shortName = command.split(':')[1];
          const button = new PositionedButton({
            ...others,
            callback: (): void => {
              this._commands.execute(command);
            },
            className: shortName && `jp-enh-cell-${shortName}`,
            tooltip: tooltip || this._commands.label(entry.command)
          });
          button.addClass(CELL_BAR_CLASS);
          button.addClass(`jp-enh-cell-${cellType || 'all'}`);
          (cell.layout as PanelLayout).addWidget(button);
        }
      });
    }
  }

  private _getCell(model: ICellModel): Cell {
    return this._panel.content.widgets.find(widget => widget.model === model);
  }

  private _findToolbarWidgets(cell: Cell): Widget[] {
    const widgets = (cell.layout as PanelLayout).widgets;

    // Search for header using the CSS class or use the first one if not found.
    return widgets.filter(widget => widget.hasClass(CELL_BAR_CLASS)) || [];
  }

  private _removeToolbar(model: ICellModel): void {
    const cell = this._getCell(model);
    if (cell) {
      this._findToolbarWidgets(cell).forEach(widget => widget.dispose());
    }
  }

  /**
   * Call back on settings changes
   */
  private _onSettingsChanged(): void {
    // Update menu items
    const leftItems = (this._settings.composite['leftMenu'] as any) as
      | ICellMenuItem[]
      | null;
    // Test to avoid useless signal emission
    if (this._leftMenuItems.length > 0) {
      this._leftMenuItems.clear();
    }
    if (leftItems) {
      if (leftItems.length > 0) {
        this._leftMenuItems.pushAll(leftItems);
      }
    } else {
      this._leftMenuItems.pushAll(DEFAULT_LEFT_MENU);
    }
    const rightItems = ((this._settings.composite['rightMenu'] as any) ||
      []) as ICellMenuItem[];
    // Test to avoid useless signal emission
    if (this._rightMenuItems.length > 0) {
      this._rightMenuItems.clear();
    }
    if (rightItems.length > 0) {
      this._rightMenuItems.pushAll(rightItems);
    }

    // Update tags
    const newDefaultTags =
      (this._settings.composite['defaultTags'] as string[]) || [];
    // Update default tag in shared tag list
    const toAdd = newDefaultTags.filter(
      tag => !this._previousDefaultTags.includes(tag)
    );
    if (toAdd.length > 0) {
      this._allTags.pushAll(toAdd);
    }
    this._previousDefaultTags
      .filter(tag => !newDefaultTags.includes(tag))
      .forEach(tag => this._allTags.removeValue(tag));
    this._previousDefaultTags = newDefaultTags;

    // Update left space
    const leftSpace = (this._settings?.composite['leftSpace'] as number) || 0;
    this._panel.node
      .querySelectorAll(`div.${LEFT_SPACER_CLASSNAME}`)
      .forEach(node => {
        (node as HTMLElement).style.width = `${leftSpace}px`;
      });
  }

  private _allTags: ObservableList<string> = new ObservableList<string>();
  private _commands: CommandRegistry;
  private _isDisposed = false;
  private _leftMenuItems: ObservableList<ICellMenuItem> = new ObservableList<
    ICellMenuItem
  >();
  private _previousDefaultTags = new Array<string>();
  private _panel: NotebookPanel;
  private _rightMenuItems: ObservableList<ICellMenuItem> = new ObservableList<
    ICellMenuItem
  >();
  private _settings: ISettingRegistry.ISettings | null;
}

/**
 * Widget extension that creates a CellToolbarTracker each time a notebook is
 * created.
 */
export class CellBarExtension implements DocumentRegistry.WidgetExtension {
  constructor(
    commands: CommandRegistry,
    settings: ISettingRegistry.ISettings | null
  ) {
    this._commands = commands;
    this._settings = settings;
  }

  createNew(panel: NotebookPanel): IDisposable {
    return new CellToolbarTracker(panel, this._commands, this._settings);
  }

  private _commands: CommandRegistry;
  private _settings: ISettingRegistry.ISettings | null;
}
