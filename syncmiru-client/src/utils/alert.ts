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

export const showTemporalErrorAlertForModal = (message: string, autoHideTime: number = 3000) => {
    StatusAlertService.showError(message, {
        autoHide: true,
        withCloseIcon: false,
        autoHideTime: autoHideTime
    })
}

export const showTemporalSuccessAlertForModal = (message: string, autoHideTime: number = 3000) => {
    StatusAlertService.showSuccess(message, {
        autoHide: true,
        withCloseIcon: false,
        autoHideTime: autoHideTime
    })
}