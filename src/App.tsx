import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import MainLayout from '@/layouts/MainLayout'
import HomePage from '@/pages/HomePage'
import ErrorPage from '@/pages/ErrorPage'
import PageSpinner from '@/components/ui/PageSpinner'

// Početna i layout idu u glavni paket; ostale stranice se dohvaćaju tek kad se otvore.
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const TeamPage = lazy(() => import('@/pages/TeamPage'))
const KategorijaPage = lazy(() => import('@/pages/KategorijaPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const UtakmicePage = lazy(() => import('@/pages/UtakmicePage'))
const UtakmicaDetaljPage = lazy(() => import('@/pages/UtakmicaDetaljPage'))
const MomcadPage = lazy(() => import('@/pages/MomcadPage'))
const StatistikaPage = lazy(() => import('@/pages/StatistikaPage'))
const PostaniClanPage = lazy(() => import('@/pages/PostaniClanPage'))
const AdminPage = lazy(() => import('@/pages/AdminPage'))
const PrivatnostPage = lazy(() => import('@/pages/PrivatnostPage'))
const GalleryPage = lazy(() => import('@/pages/GalleryPage'))

function page(element: ReactNode) {
  return <Suspense fallback={<PageSpinner />}>{element}</Suspense>
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'o-klubu', element: page(<AboutPage />) },
      { path: 'strucni-stozer', element: page(<TeamPage />) },
      { path: 'kategorije/:kat?', element: page(<KategorijaPage />) },
      { path: 'kontakt', element: page(<ContactPage />) },
      { path: 'utakmice', element: page(<UtakmicePage />) },
      { path: 'utakmice/:id', element: page(<UtakmicaDetaljPage />) },
      { path: 'momcad', element: page(<MomcadPage />) },
      { path: 'statistika', element: page(<StatistikaPage />) },
      { path: 'galerija', element: page(<GalleryPage />) },
      { path: 'postani-clan', element: page(<PostaniClanPage />) },
      { path: 'privatnost', element: page(<PrivatnostPage />) },
      { path: 'admin', element: page(<AdminPage />) },
      { path: '*', element: page(<NotFoundPage />) },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
