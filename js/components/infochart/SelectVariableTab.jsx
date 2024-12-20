import React, { useState } from 'react';
import DropdownList from 'react-widgets/lib/DropdownList';
import Multiselect from 'react-widgets/lib/Multiselect';
import Message from '../../../MapStore2/web/client/components/I18N/Message';

const SelectVariableTab = ({ tabList, onChangeVariable, onChangeSpiSpei }) => {
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
                                    onChange={(value) => onChangeVariable(value)}
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
                                    onChange={(value) => onChangeSpiSpei(value)}
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

/*
import React from 'react';
import DropdownList from 'react-widgets/lib/DropdownList';
import Multiselect from 'react-widgets/lib/Multiselect';
import Message from '../../../MapStore2/web/client/components/I18N/Message';

const SelectVariableMenu = ({ variableList, spiList, speiList, variabileMeteo, spiSpeiCombined,
    onChangeVariable, onChangeSpiSpei }) => {
    // Combina SPI e SPEI in un'unica lista, aggiungendo una proprietà 'group'
    const combinedList = [
        ...spiList.map(item => ({ id: item, name: item, group: 'SPI' })),
        ...speiList.map(item => ({ id: item, name: item, group: 'SPEI' }))
    ];

    return (
        <div id="infochart-dropdown-container" style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            justifyContent: 'flex-start'
        }}>
            <DropdownList
                key="variabileMeteo"
                data={variableList}
                valueField="id"
                textField="name"
                value={variabileMeteo}
                onChange={(value) => onChangeVariable(value)}
                placeholder={<Message msgId="infochart.selectMeteoVariable"/>}
                style={{
                    width: '200px',
                    height: '35px'
                }}
            />
            <Multiselect
                key="spiSpeiCombined"
                data={combinedList}
                valueField="id"
                textField="name"
                groupBy="group"
                value={spiSpeiCombined}
                onChange={(value) => onChangeSpiSpei(value)}
                placeholder={<Message msgId="infochart.spiSpeiCombined"/>}
                multiple
                style={{
                    width: '200px',
                    height: '35px'
                }}
            />
        </div>
    );
};

export default SelectVariableMenu;
*/
