import React from 'react';
import AceEditor from 'react-ace';
import './Editor.css';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-solarized_dark';
import 'ace-builds/src-noconflict/theme-solarized_light';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-tomorrow';
import 'ace-builds/src-noconflict/ext-language_tools';

function Editor({ editorValue, updateEditorValue, readOnly, theme }) {
    function onChange(newValue) {
        updateEditorValue(newValue);
    }

    return (
        <div className='editor-container'>
            <AceEditor
                className='ace-editor'
                mode='python'
                onChange={onChange}
                theme={theme}
                value={editorValue}
                name='Script Editor'
                placeholder='Enter Script'
                fontSize={14}
                showPrintMargin={true}
                showGutter={true}
                highlightActiveLine={true}
                readOnly={readOnly}
                setOptions={{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    showLineNumbers: true,
                    tabSize: 4,
                }}
            />
        </div>
    );
}

export default Editor;
