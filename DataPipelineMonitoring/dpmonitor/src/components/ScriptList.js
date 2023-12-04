import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import './ScriptList.css';

function ScriptList({ onScriptSelect, scriptList, activeIndex }) {
    if (scriptList.length === 0) {
        return (
            <div className='script-list'>
                <p className='create-script-message'>
                    Create a script to begin
                </p>
            </div>
        );
    }
    return (
        <div>
            <ListGroup
                className='script-list'
                defaultActiveKey='#0'
                onClick={onScriptSelect}
                activeKey={`#${activeIndex}`}
            >
                {scriptList.map((item, i) => {
                    return (
                        <ListGroup.Item action href={`#${i}`} key={i}>
                            {item.name}
                        </ListGroup.Item>
                    );
                })}
            </ListGroup>
        </div>
    );
}

export default ScriptList;
