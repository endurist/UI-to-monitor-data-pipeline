import React from 'react';
import './Grid.css';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

function Grid({ rowData, fields }) {
    // Dynamically generated columns from the fields array
    return (
        <div className='data-grid ag-theme-alpine'>
            <AgGridReact rowData={rowData}>
                {fields &&
                    fields.map((item, i) => {
                        return (
                            <AgGridColumn field={item} key={i}></AgGridColumn>
                        );
                    })}
            </AgGridReact>
        </div>
    );
}

export default Grid;
