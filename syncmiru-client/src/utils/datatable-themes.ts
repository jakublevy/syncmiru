import {createTheme} from "react-data-table-component";

createTheme('mydark',
    {
        text: {
            primary: '#eeeeee',
            secondary: 'rgba(255, 255, 255, 0.7)',
            disabled: 'rgba(0,0,0,.12)',
        },
        background: {
            default: '#292b2f',
        },
        context: {
            background: '#E91E63',
            text: '#FFFFFF',
        },
        divider: {
            default: 'rgba(81, 81, 81, 1)',
        },
        button: {
            default: '#FFFFFF',
            focus: 'rgba(255, 255, 255, .54)',
            hover: 'rgba(255, 255, 255, .12)',
            disabled: 'rgba(255, 255, 255, .18)',
        },
        selected: {
            default: 'rgba(0, 0, 0, .7)',
            text: '#FFFFFF',
        },
        highlightOnHover: {
            default: 'rgba(0, 0, 0, .7)',
            text: '#FFFFFF',
        },
        striped: {
            default: 'rgba(0, 0, 0, .87)',
            text: '#FFFFFF',
        },
    }
)