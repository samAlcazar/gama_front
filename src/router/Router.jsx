import { createBrowserRouter, RouterProvider } from 'react-router'
import App from '../pages/App.jsx'
import Home from '../pages/home/Home.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      {
        index: true,
        Component: Home
      }
    ]
  }
])

const Router = () => {
  return (
    <RouterProvider router={router} />
  )
}

export default Router

