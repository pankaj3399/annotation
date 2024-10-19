import {
  ClipboardList,
  Folder,
  LayoutGrid,
  LucideIcon,
  SquarePen
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  const projectId = pathname.split("/")[pathname.split("/").length - 1]
  const fpath= pathname.split("/")[1]

  if(fpath == 'tasks'){
    return [
      {
        groupLabel: "Contents",
        menus: [
          {
            href: "/tasks",
            label: "Projects",
            active: pathname.includes("/tasks") && !pathname.includes("/tasks/all"),
            // active: pathname == '/tasks',
            icon: Folder
          },
          {
            href: `/tasks/all`,
            label: "All Tasks",
            active: pathname == '/tasks/all',
            icon: ClipboardList
          }
        ]
      }
    ];
  }

  if(projectId == "" || projectId == 'dashboard') {
    return [
      {
        groupLabel: "",
        menus: [
          {
            href: "/dashboard",
            label: "Dashboard",
            active: pathname.includes("/dashboard"),
            icon: LayoutGrid,
            submenus: []
          }
        ]
      },{
        groupLabel: "Contents",
        menus: [
          {
            href: "/",
            label: "Projects",
            active: pathname == '/',
            icon: SquarePen,
          },
        ]
      },
    ];
  }
  

  return [
    {
      groupLabel: "",
      menus: [
        {
          href: `/dashboard/${projectId}`,
          label: "Dashboard",
          active: pathname.includes("/dashboard/"),
          icon: LayoutGrid,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Contents",
      menus: [
        {
          href: "/",
          label: "Projects",
          active: pathname == '/',
          icon: Folder
        },
        {
          href: `/projects/${projectId}`,
          label: "Templates",
          active: pathname.includes("/projects") && !pathname.includes("/task"),
          icon: SquarePen
        },
        {
          href: `/projects/task/${projectId}`,
          label: "Tasks",
          active: pathname.includes("/task"),
          icon: ClipboardList
        }
      ]
    },
  ];
}
