import {StatusAlertService} from "react-status-alert";

export const showPersistentErrorAlert = (message: string) => {
    StatusAlertService.showError(message, {
        autoHide: false
    })
}

export const showPersistentWarningAlert = (message: string) => {
    StatusAlertService.showWarning(message, {
        autoHide: false
    })
}