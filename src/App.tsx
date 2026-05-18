import { createBrowserRouter, RouterProvider } from 'react-router'
import MainLayout from '@/layouts/MainLayout'
import HomePage from '@/pages/HomePage'
import AboutPage from '@/pages/AboutPage'
import TeamPage from '@/pages/TeamPage'
import KategorijaPage from '@/pages/KategorijaPage'
import ContactPage from '@/pages/ContactPage'
import NovostiPage from '@/pages/NovostiPage'
import NotFoundPage from '@/pages/NotFoundPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'team', element: <TeamPage /> },
      { path: 'kategorije', element: <KategorijaPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'novosti', element: <NovostiPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
