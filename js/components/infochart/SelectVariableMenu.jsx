import React from 'react';
import DropdownList from 'react-widgets/lib/DropdownList';
import Message from '../../../MapStore2/web/client/components/I18N/Message';

const SelectVariableMenu = ({ variableList, spiList, speiList, variabileMeteo, spiSpeiCombined, onChangeVariable }) => {
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
            {/* Dropdown per la variabile meteo */}
            <DropdownList
                key="variabileMeteo"
                data={variableList}
                valueField="id"
                textField="name"
                value={variabileMeteo}
                onChange={(value) => onChangeVariable(value, 'variabiliMeteo')}
                placeholder={<Message msgId="infochart.selectMeteoVariable"/>}
                style={{
                    width: '200px',
                    height: '35px'
                }}
            />

            {/* Dropdown combinato SPI e SPEI */}
            <DropdownList
                key="spiSpeiCombined"
                data={combinedList}
                valueField="id"
                textField="name"
                groupBy="group"
                value={spiSpeiCombined}
                onChange={(value) => onChangeVariable(value, 'spiSpeiCombined')}
                placeholder={<Message msgId="infochart.spiSpeiCombined"/>}
                style={{
                    width: '200px',
                    height: '35px'
                }}
            />
        </div>
    );
};

export default SelectVariableMenu;
