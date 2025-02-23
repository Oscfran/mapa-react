import { useEffect } from "react";

function useDocumentTitle(title) {
    useEffect(() => {
         console.log(title);
        document.title = title;
    },[title]);//executes only when title changes
};

export default useDocumentTitle;
