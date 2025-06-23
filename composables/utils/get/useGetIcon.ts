import SidebarOpen from '@/assets/icons/sidebar-open.svg';
import SidebarClose from '@/assets/icons/sidebar-close.svg';
import Flag from '@/assets/icons/flag.svg';
import Folder from '@/assets/icons/folder.svg';
import FolderPlus from '@/assets/icons/folder-plus.svg';
import UserSquare from '@/assets/icons/user-square.svg';

import type { IconName } from '@/types/general';

export const useGetIcon = (value: IconName): Component | undefined => {
    const icons = {
        'sidebar-open': SidebarOpen,
        'sidebar-close': SidebarClose,
        flag: Flag,
        folder: Folder,
        'folder-plus': FolderPlus,
        'user-square': UserSquare,
    };

    return icons[value];
};