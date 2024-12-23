import React, { useState } from 'react';
import DropdownList from 'react-widgets/lib/DropdownList';
import Multiselect from 'react-widgets/lib/Multiselect';

const SelectVariableTab = ({ tabList, onChangeSingleVariable, onChangeMultiVariable }) => {
    // Stato per tracciare il tab attivo
    const [activeTab, setActiveTab] = useState(tabList[0]?.id); // Di default il primo tab è attivo

    return (
        <div id="infochart-dropdown-container">
            {/* Tab Bar */}
            <div style={{
                display: 'flex',
                borderBottom: '1px solid #ccc',
                marginBottom: '10px',
                cursor: 'pointer'
            }}>
                {tabList.map(tab => (
                    <div
                        key={tab.id}
                        style={{
                            padding: '10px 20px',
                            borderBottom: activeTab === tab.id ? '2px solid #007bff' : 'none',
                            color: activeTab === tab.id ? '#007bff' : '#000'
                        }}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.name}
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '10px' }}>
                {tabList.map(tab => {
                    if (tab.id === activeTab) {
                        if (tab.type === 'dropdown') {
                            return (
                                <DropdownList
                                    key={tab.id}
                                    data={tab.groupList}
                                    valueField="id"
                                    textField="name"
                                    onChange={(value) => onChangeSingleVariable(value)}
                                />
                            );
                        } else if (tab.type === 'multiselect') {
                            // Render Multiselect
                            return (
                                <Multiselect
                                    key={tab.id}
                                    data={tab.groupList}
                                    valueField="id"
                                    textField="name"
                                    onChange={(value) => onChangeMultiVariable(value)}
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
