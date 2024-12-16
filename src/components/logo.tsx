import { appConfig } from "@/config/app";
import { Icons } from "./icons";
import React from "react";

export function Logo() {
    return (
        <>
            <Icons.logo className="h-6 w-6" />
            <span className="font-bold">{appConfig.name}</span>
        </>
    )
}