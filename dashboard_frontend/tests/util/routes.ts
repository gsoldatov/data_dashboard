import React from "react";
import { Route } from "react-router-dom";

/** Props shape of a `<Route>` element extracted from JSX. */
interface RouteProps {
    path?: string;
    index?: boolean;
    element?: React.ReactElement;
    children?: React.ReactNode;
}

/**
 * Walk the full route tree and return every leaf path under the
 * `<Route>` whose `element` matches `guardComponent`.
 */
export function findProtectedRoutes(
    root: React.ReactNode,
    guardComponent: React.ComponentType,
): string[] {
    function collectLeaves(node: React.ReactNode, basePath: string): string[] {
        const children = React.Children.toArray(
            (node as React.ReactElement).props?.children ?? node,
        );
        const paths: string[] = [];

        for (const child of children) {
            if (!React.isValidElement(child) || child.type !== Route) continue;

            const props = child.props as RouteProps;

            if (props.index) {
                paths.push(basePath);
                continue;
            }

            const currentPath = `${basePath}/${props.path}`;

            if (props.children) {
                const childArray = React.Children.toArray(props.children);
                const hasRouteChildren = childArray.some(
                    (c) => React.isValidElement(c) && c.type === Route,
                );
                if (hasRouteChildren) {
                    paths.push(
                        ...collectLeaves(props.children, currentPath),
                    );
                } else {
                    paths.push(currentPath);
                }
            } else {
                paths.push(currentPath);
            }
        }

        return paths;
    }

    function walk(node: React.ReactNode, basePath: string): string[] {
        const children = React.Children.toArray(
            (node as React.ReactElement).props?.children ?? node,
        );
        const paths: string[] = [];

        for (const child of children) {
            if (!React.isValidElement(child) || child.type !== Route) continue;

            const props = child.props as RouteProps;
            const currentPath = props.index
                ? basePath
                : `${basePath}/${props.path}`;

            if (
                React.isValidElement(props.element) &&
                props.element.type === guardComponent
            ) {
                if (props.children) {
                    paths.push(
                        ...collectLeaves(props.children, currentPath),
                    );
                } else {
                    paths.push(currentPath);
                }
            } else if (props.children) {
                paths.push(...walk(props.children, currentPath));
            }
        }

        return paths;
    }

    const result = walk(root, "");
    if (result.length === 0) {
        throw new Error(
            `${guardComponent.name} not found in route tree`,
        );
    }
    return result;
}
