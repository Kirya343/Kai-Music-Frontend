"use client"

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import styles from "./KebabMenu.module.scss";
import { EllipsisVerticalIcon } from "@/assets/icons";
import clsx from "clsx";
import { ReactNode } from "react";

/**
 * IKebabAction is interface for kebab-menu-action
 * 
 * @param title is displayable title
 * @param func is void that uses on click to action
 * @param icon is react-svg icon that should describe action
 */
export interface IKebabAction {
    title: string,
    func: () => void,
    icon?: ReactNode,
    access?: boolean
};

interface KebabMenuProps {
    actions: IKebabAction[];
    className?: string;
}

/**
 * KebabMenu is component that creates kebab-menu with any actions
 * 
 * @param actions is list of actions for menu
 * @param className is className to design open-button
 */
const KebabMenu = ({ actions, className }: KebabMenuProps) => {
    const filtered = actions.filter((action) => action.access ?? true);

    /**
     * menu doesn't display without actions
     */
    if (filtered.length === 0) {
        return null;
    }

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button
                    type="button"
                    className={clsx(styles.button, className, "hover")}
                    aria-label="Действия"
                >
                    <EllipsisVerticalIcon className={styles.icon} />
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    className={styles.list}
                    sideOffset={4}
                    align="start"
                >
                    {filtered.map((action) => (
                        <DropdownMenu.Item
                            key={action.title}
                            className={`${styles.item} hover`}
                            onSelect={action.func}
                        >
                            {action.icon && (
                                <div className={styles.itemIcon}>
                                    {action.icon}
                                </div>
                            )}

                            <span>{action.title}</span>
                        </DropdownMenu.Item>
                    ))}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};

export default KebabMenu;