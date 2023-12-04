import React, { useState, useEffect } from 'react';
import Grid from './Grid';
import './Data.css';
import Button from 'react-bootstrap/Button';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import ProjectList from './ProjectList';
import ProjectScriptAccordion from './ProjectScriptAccordion';

function Data({ token, projects }) {
    // Default selected project is index 0 in array
    const [selectedProject, setSelectedProject] = useState(projects[0]);
    const [selectedScript, setSelectedScript] = useState();
    const [activeProjectIndex, setActiveProjectIndex] = useState(0);
    const [inputRowData, setInputRowData] = useState([]);
    const [inputFields, setInputFields] = useState([]);
    const [outputRowData, setOutputRowData] = useState([]);
    const [outputFields, setOutputFields] = useState([]);

    useEffect(() => {
        if (selectedProject) {
            // Fetch ingested data for the selected project
            fetch(`http://localhost:8080/API/input_data/${selectedProject.id}`)
                .then((response) => response.json())
                .then((json) => {
                    // Set response to row data and fields array to keys of the json data
                    setInputRowData(json);
                    setInputFields(Object.keys(json[0]));
                })
                .catch((error) => {
                    console.log('Error ', error);
                });
        }
    }, [selectedProject]);

    useEffect(() => {
        if (selectedScript) {
            // Fetch output data for the selected script
            fetch(
                `http://localhost:8080/API/output_data/${token.unityid}/${selectedScript.id}`
            )
                .then((response) => response.json())
                .then((json) => {
                    setOutputRowData(json);
                    setOutputFields(Object.keys(json[0]));
                })
                .catch((error) => {
                    console.log('Error ', error);
                });
        }
    }, [selectedScript, token]);

    // On click of project list, set state to currently selected project
    function onProjectSelect(e) {
        let nodes = Array.prototype.slice.call(e.currentTarget.children);
        let index = nodes.indexOf(e.target);
        let currentProject = projects[index];
        setSelectedProject(currentProject);
        setActiveProjectIndex(index);
    }

    // On click of script list, set state to currently selected script
    function onScriptSelect(e, projectIndex, scriptIndex) {
        setSelectedScript(projects[projectIndex].scripts[scriptIndex]);
        setActiveProjectIndex(projectIndex);
    }

    // Convert current row data to csv to be downloaded on Export Data button click
    function exportData(fields, rowData, filename) {
        if (!fields.length || !rowData.length) {
            return;
        }

        let array = typeof rowData != 'object' ? JSON.parse(rowData) : rowData;
        let csvString = fields.join(',') + '\n';

        for (let i = 0; i < array.length; i++) {
            let line = '';
            for (let index in array[i]) {
                if (line !== '') line += ',';
                line += array[i][index];
            }
            csvString += line + '\n';
        }

        let fileData = new Blob([csvString], { type: 'text/csv' });
        let csvURL = window.URL.createObjectURL(fileData);
        let tempLink = document.createElement('a');
        tempLink.href = csvURL;
        tempLink.setAttribute('download', `${filename}.csv`);
        tempLink.click();
    }

    return (
        <div className='data-page'>
            <Tabs defaultActiveKey='input'>
                <Tab eventKey='input' title='Input Data'>
                    <div className='data-view-container'>
                        <div className='grid-container'>
                            <h4 className='headings'>Input Data</h4>
                            <Grid
                                className='grid'
                                rowData={inputRowData}
                                fields={inputFields}
                            />
                            <Button
                                className='export-button'
                                variant='outline-primary'
                                disabled={
                                    !selectedProject || !inputRowData.length
                                }
                                onClick={(e) =>
                                    exportData(
                                        inputFields,
                                        inputRowData,
                                        `${selectedProject.name}_input`
                                    )
                                }
                            >
                                Export Data
                            </Button>
                        </div>
                        <div className='list-container'>
                            <h4 className='headings'>Projects</h4>
                            <ProjectList
                                onProjectSelect={onProjectSelect}
                                projects={projects}
                                activeIndex={activeProjectIndex}
                            />
                        </div>
                    </div>
                </Tab>
                <Tab eventKey='output' title='Output Data'>
                    <div className='data-view-container'>
                        <div className='grid-container'>
                            <h4 className='headings'>Output Data</h4>
                            <Grid
                                className='grid'
                                rowData={outputRowData}
                                fields={outputFields}
                            />
                            <Button
                                className='export-button'
                                variant='outline-primary'
                                disabled={
                                    !selectedScript || !outputRowData.length
                                }
                                onClick={(e) =>
                                    exportData(
                                        outputFields,
                                        outputRowData,
                                        `${selectedScript.name}_output`
                                    )
                                }
                            >
                                Export Data
                            </Button>
                        </div>
                        <div className='list-container'>
                            <h4 className='headings'>Projects</h4>
                            <div className='data-accordion-list'>
                                <ProjectScriptAccordion
                                    onScriptSelect={onScriptSelect}
                                    projects={projects}
                                />
                            </div>
                        </div>
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
}

export default Data;
