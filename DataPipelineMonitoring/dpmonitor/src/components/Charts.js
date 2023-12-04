import React, { Component } from 'react';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import TableRenderers from 'react-pivottable/TableRenderers';
import Plot from 'react-plotly.js';
import createPlotlyRenderers from 'react-pivottable/PlotlyRenderers';
import 'react-pivottable/pivottable.css';
import './Charts.css';
import ProjectScriptAccordion from './ProjectScriptAccordion';

// create Plotly renderers via dependency injection
const PlotlyRenderers = createPlotlyRenderers(Plot);

class Charts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedProject: 0,
            selectedScriptIndex: 0,
            activeProjectIndex: 0,
            activeIndex: 0,
            data: [],
        };
        this.handleClick = this.handleClick.bind(this);
    }

    // fetch data and change data format
    componentDidUpdate() {
        if (this.props.scripts) {
            // fetch data for the selected script
            fetch(
                `http://localhost:8080/API/output_data/${
                    this.props.token.unityid
                }/${this.props.scripts[this.state.selectedScriptIndex].id}`
            )
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    let dataArray = [];
                    dataArray.push(Object.keys(data[0]));
                    for (let i = 0; i < data.length; i++) {
                        dataArray.push(Object.values(data[i]));
                    }
                    this.setState({ data: dataArray });
                })
                .catch((error) => {
                    console.log('Error ', error);
                });
        }
    }

    // On click of script list, set state to currently selected script
    handleClick(e, projectIndex, scriptIndex) {
        this.setState({ selectedScriptIndex: scriptIndex });
        this.setState({
            selectedScript: this.props.projects[projectIndex].scripts[
                scriptIndex
            ],
        });
        this.setState({ activeProjectIndex: projectIndex });
    }

    render() {
        if (!this.props.scripts.length) {
            return (
                <div className='no-projects-container'>
                    Create a script to begin
                </div>
            );
        }
        return (
            <div className='chart-view-container'>
                <div className='chart-container'>
                    <PivotTableUI
                        data={this.state.data}
                        onChange={(s) => this.setState(s)}
                        renderers={Object.assign(
                            {},
                            TableRenderers,
                            PlotlyRenderers
                        )}
                        {...this.state}
                    />
                </div>

                <div className='list-container'>
                    <h4 className='headings'>Projects</h4>
                    <div className='chart-accordion-list'>
                        <ProjectScriptAccordion
                            onScriptSelect={this.handleClick}
                            projects={this.props.projects}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default Charts;
