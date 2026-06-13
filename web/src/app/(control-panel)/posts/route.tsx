import type { RouteItemType } from "@/types"
import { Outlet } from "react-router"
import PostsListPage from "./PostsListPage"
import PostEditorPage from "./PostEditorPage"

const route: RouteItemType = {
  path: "posts",
  element: <Outlet />,
  auth: ["admin", "editor", "author"],
  children: [
    {
      index: true,
      element: <PostsListPage />,
      settings: { page: { title: "Posts" } },
    },
    {
      path: "new",
      element: <PostEditorPage />,
      settings: {
        page: { title: "New Post" },
        layout: {
          config: {
            leftSidePanel: {
              display: false,
            },
          },
        },
      },
    },
    {
      path: ":slug/edit",
      element: <PostEditorPage />,
      settings: {
        page: { title: "Edit Post" },
        layout: {
          config: {
            leftSidePanel: {
              display: false,
            },
          },
        },
      },
    },
  ],
}

export default route
