import {StatusAlertService} from "react-status-alert";

export const showErrorAlert = (message: string) => {
    StatusAlertService.showError(message, {
      autoHide: false
    })
}

export const showWarningAlert = (message: string) => {
    StatusAlertService.showWarning(message, {
        autoHide: false
    })
}

export const showSuccessAlert = (message: string) => {
    StatusAlertService.showSuccess(message)
}