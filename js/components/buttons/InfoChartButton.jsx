/*
 * Copyright 2024, Consorzio LaMMA.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';

import ToggleButton from '../../../MapStore2/web/client/components/buttons/ToggleButton';
import {Tooltip} from 'react-bootstrap';
import Message from '../../../MapStore2/web/client/components/I18N/Message';

/**
 * Toggle button for the InfoChart. Wraps {@link #components.buttons.ToggleButton} with some default properties.
 * @memberof components.buttons
 * @function
 * @prop {string} [id] an id for the html component
 * @prop {object} [btnConfig] the configuration to pass to the bootstrap button
 * @prop {object} [options] the options to send when toggle is clicked
 * @prop {string|element} [text] the text to disaplay
 * @prop {string|element} [help] the help text
 * @prop {string} glyphicon the icon name
 * @prop {bool} active the status of the button
 * @prop {function} onClick. The method to call when clicked. the method will return as parameter the toggled `pressed` prop and the `options` object
 * @prop {node} [activeTooltip] the tooltip to use on mouse hover
 * @prop {node} [notActiveTooltip] the tooltip to use on mouse hover when the button is active
 * @prop {string} [tooltipPlace] positon of the tooltip, one of: 'top', 'right', 'bottom', 'left'
 * @prop {object} css style object for the component
 * @prop {btnType} [btnType] one of 'normal', 'image'
 * @prop {string} image if type is 'image', the src of the image
 * @prop {string} pressedStyle the bootstrap style for pressedStyle
 * @prop {string} defaultStyle the bootstrap style when not pressed
 *
 */
const InfoChartButton = ({
    id = 'infochart-btn',
    btnConfig = { className: "square-button" },
    options,
    text,
    glyphicon = 'signal',
    active,
    onClick,
    activeTooltip = 'infochart.tooltipDeactivate',
    notActiveTooltip = 'infochart.tooltipActivate',
    tooltipPlace = 'left',
    style,
    btnType,
    image,
    pressedStyle = 'success',
    defaultStyle = 'primary'
}) => {

    const getButtonProperties = () => ({
        id,
        btnConfig,
        options,
        text,
        glyphicon,
        onClick,
        tooltipPlace,
        style,
        btnType,
        image,
        pressedStyle,
        defaultStyle
    });

    return (
        <ToggleButton
            {...getButtonProperties()}
            pressed={active}
            tooltip={
                <Tooltip id="infochart-button-tip">
                    <Message msgId={active ? activeTooltip : notActiveTooltip} />
                </Tooltip>
            }
        />
    );
};

InfoChartButton.propTypes = {
    id: PropTypes.string,
    btnConfig: PropTypes.object,
    options: PropTypes.object,
    text: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    help: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    glyphicon: PropTypes.string,
    active: PropTypes.bool,
    onClick: PropTypes.func,
    activeTooltip: PropTypes.string,
    notActiveTooltip: PropTypes.string,
    tooltipPlace: PropTypes.string,
    style: PropTypes.object,
    btnType: PropTypes.oneOf(['normal', 'image']),
    image: PropTypes.string,
    pressedStyle: PropTypes.string,
    defaultStyle: PropTypes.string
};

export default InfoChartButton;
