import React from 'react';

const TabBar = ({ tabList = [], onChangeTab, activeTab, classAttribute }) => {
    const selectedTab = activeTab || (tabList.length > 0 ? tabList[0] : null);
    const containerClass = classAttribute + "-tabbar";

    return (
        <div className={containerClass}>
            {tabList.map(tab => {
                const itemClass = containerClass + "-item";

                return (
                    <div
                        key={tab.id}
                        className={itemClass}
                        style={{
                            borderBottom: selectedTab?.id === tab.id ? '2px solid #007bff' : 'none',
                            color: selectedTab?.id === tab.id ? '#007bff' : '#000'
                        }}
                        onClick={() => onChangeTab(tab.id)}
                    >
                        {tab.name}
                    </div>
                );
            })}
        </div>
    );
};

export default TabBar;
