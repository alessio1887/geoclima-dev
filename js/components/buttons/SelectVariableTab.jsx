import React from 'react';
import DropdownList from 'react-widgets/lib/DropdownList';
import Multiselect from 'react-widgets/lib/Multiselect';
import TabBar from './TabBar';
import { DROP_DOWN, MULTI_SELECT } from '../../utils/VariabiliMeteoUtils';

const SelectVariableTab = ({
    idContainer,
    tabList,
    onChangeSingleVariable,
    onChangeMultiVariable,
    onChangeTab,
    activeTab,
    isInteractionDisabled
}) => {
    return (
        <div id={idContainer}>
            {/* Tab Bar */}
            <TabBar tabList={tabList} activeTab={activeTab} onChangeTab={onChangeTab} classAttribute={idContainer} />
            <div style={{ marginTop: '10px' }}>
                {tabList.map(tab => {
                    if (tab.id === activeTab.id) {
                        if (tab.menuType === DROP_DOWN) {
                            return (
                                <DropdownList
                                    key={tab.id}
                                    data={tab.groupList}
                                    valueField="id"
                                    textField="name"
                                    value={activeTab.variables[0]}
                                    onChange={(value) => onChangeSingleVariable(value, activeTab.id)}
                                    disabled={isInteractionDisabled}
                                />
                            );
                        } else if (tab.menuType === MULTI_SELECT) {
                            // Render Multiselect
                            return (
                                <Multiselect
                                    key={tab.id}
                                    data={tab.groupList}
                                    valueField="id"
                                    textField="name"
                                    onChange={(value) => {
                                        if (value.length === 0) {
                                            onChangeMultiVariable(activeTab.id, [tab.groupList[0]]);
                                        } else {
                                            onChangeMultiVariable(activeTab.id, value);
                                        }
                                    }}
                                    value={activeTab.variables}
                                    disabled={isInteractionDisabled}
                                />
                            );
                        }
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

export default SelectVariableTab;
