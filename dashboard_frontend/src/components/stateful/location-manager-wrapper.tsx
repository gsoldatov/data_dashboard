import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store";
import { setRedirectOnRender } from "@/store/slices/ui";

export const LocationManageWrapper = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const redirectOnRender = useAppSelector((state) => state.ui.redirectOnRender);

    useEffect(() => {
        if (redirectOnRender) {
            dispatch(setRedirectOnRender(""));
            navigate(redirectOnRender);
        }
    }, [redirectOnRender, navigate, dispatch]);

    return <>{children}</>;
};
