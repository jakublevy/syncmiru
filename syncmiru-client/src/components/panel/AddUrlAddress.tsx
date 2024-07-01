import React, {ChangeEvent, ReactElement, useEffect, useState} from "react";
import Link from "@components/svg/Link.tsx";
import {MenuItem} from "@szhsin/react-menu";
import {useTranslation} from "react-i18next";
import {ModalWHeader} from "@components/widgets/Modal.tsx";
import {BtnPrimary} from "@components/widgets/Button.tsx";

export default function AddUrlAddress(): ReactElement {
    const {t} = useTranslation()
    const [showModal, setShowModal] = useState<boolean>(false);
    const [urlContent, setUrlContent] = useState<string>("");
    const [filledUrlCount, setFilledUrlCount] = useState<number>(0);
    const [urls, setUrls] = useState<Array<string>>([]);
    const urlInputValid = filledUrlCount === urls.length && urls.length > 0

    useEffect(() => {
        console.log(urls)
    }, [urls]);

    function addClicked() {
        setShowModal(true)
    }

    function urlAreaChanged(e: ChangeEvent<HTMLTextAreaElement>) {
        setUrlContent(e.target.value)
        const urlArray = e.target.value.split('\n').filter(x => x !== '')
        setFilledUrlCount(urlArray.length)
        const urls = urlArray.filter(x => checkUrl(x))
        setUrls(urls)
    }

    function checkUrl(url: string): boolean {
        try {
            const parsedURL = new URL(url);
            return url.startsWith("https://") || url.startsWith("http://")
        } catch (e) {
            return false;
        }
    }

    return (
        <>
            <MenuItem
                className="w-[13rem]"
                onClick={addClicked}
            >
                <div className="flex gap-x-3">
                    <Link className="h-6 w-6"/>
                    <p>{t('add-to-playlist-url')}</p>
                </div>
            </MenuItem>
            <ModalWHeader
                title={t('modal-add-url-to-playlist')}
                open={showModal}
                setOpen={setShowModal}
                content={
                    <div className="flex flex-col gap-y-4">
                        <div>
                            <p className="mb-2">{t('modal-add-url-to-playlist-text')}</p>
                            <textarea
                                className="p-1.5 w-full h-[50dvh] border font-mono"
                                value={urlContent}
                                onChange={urlAreaChanged}
                            />
                        </div>
                        <BtnPrimary
                            className="mt-4"
                            disabled={!urlInputValid}
                        >{t('add-to-playlist-btn')}</BtnPrimary>
                    </div>
                }
                />
        </>
    )
}