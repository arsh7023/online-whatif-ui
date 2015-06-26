// the grid that uses this column should define cellEditor property!
Ext.define('Aura.util.CheckColumnEditor', {
  extend: 'Ext.ux.CheckColumn'
, xtype : 'checkcolumneditor'
, constructor: function (config) {
    Ext.apply(this, config);
    this.callParent(arguments);

    this.on(
      'checkchange'
    , function (checkColumn, rowIdx, isChecked) {
        // console.log(checkColumn, rowIdx, isChecked, checkColumn.getIndex());

        var grid, record, colIdx, originalValue, field;

        colIdx = checkColumn.getIndex();
        field = checkColumn.dataIndex;
        grid = this.findParentByType('grid');
        record = grid.store.getAt(rowIdx);
        originalValue = record.get(field);
        record.set(field, isChecked); // will set record.dirty = true;

        // construct Event Object
        var e = {
          grid: grid
        , record: record
        , field: field
        , value: isChecked
        , originalValue: originalValue
        , row: null
        , column: checkColumn
        , rowIdx: rowIdx
        , colIdx: colIdx
        };
        grid.cellEditor.fireEvent('edit', checkColumn, e);
      }
    , this
    );
  }
});

