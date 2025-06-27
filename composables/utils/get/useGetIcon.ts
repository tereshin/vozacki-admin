import SidebarOpen from '@/assets/icons/sidebar-open.svg';
import SidebarClose from '@/assets/icons/sidebar-close.svg';
import Flag from '@/assets/icons/flag.svg';
import Folder from '@/assets/icons/folder.svg';
import FolderPlus from '@/assets/icons/folder-plus.svg';
import UserSquare from '@/assets/icons/user-square.svg';
import Home from '@/assets/icons/home.svg';
import Book1 from '@/assets/icons/book-1.svg';
import Book2 from '@/assets/icons/book-2.svg';
import Users1 from '@/assets/icons/users-1.svg';
import type { IconName } from '@/types/general';

export const useGetIcon = (value: IconName): Component | undefined => {
    const icons = {
        'sidebar-open': SidebarOpen,
        'sidebar-close': SidebarClose,
        flag: Flag,
        folder: Folder,
        'folder-plus': FolderPlus,
        'user-square': UserSquare,
        home: Home,
        'book-1': Book1,
        'book-2': Book2,
        'users-1': Users1,
    };

    return icons[value];
};