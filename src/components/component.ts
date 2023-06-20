import { type ReactElement, type PropsWithChildren } from "react";

export type Component<P = {}> = (props: P) => ReactElement<P, any> | null;

export type ComponentWithChildren<P = {}> = (props: PropsWithChildren<P>) => ReactElement<P, any> | null;

export type ServerComponent<P = {}> = (props: P) => Promise<ReactElement<P, any>> | Promise<null> | ReactElement<P, any> | null;

export type ServerComponentWithChildren<P = {}> = (props: PropsWithChildren<P>) => Promise<ReactElement<P, any>> | Promise<null> | ReactElement<P, any> | null;
