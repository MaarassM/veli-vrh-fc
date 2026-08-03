import { createBrowserRouter, RouterProvider } from 'react-router'
import MainLayout from '@/layouts/MainLayout'
import HomePage from '@/pages/HomePage'
import AboutPage from '@/pages/AboutPage'
import TeamPage from '@/pages/TeamPage'
import KategorijaPage from '@/pages/KategorijaPage'
import ContactPage from '@/pages/ContactPage'
import NovostiPage from '@/pages/NovostiPage'
import NotFoundPage from '@/pages/NotFoundPage'
import UtakmicePage from '@/pages/UtakmicePage'
import UtakmicaDetaljPage from '@/pages/UtakmicaDetaljPage'
import MomcadPage from '@/pages/MomcadPage'
import StatistikaPage from '@/pages/StatistikaPage'
import PostaniClanPage from '@/pages/PostaniClanPage'
import ObavijestiPage from '@/pages/ObavijestiPage'
import GalleryPage from '@/pages/GalleryPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'o-klubu', element: <AboutPage /> },
      { path: 'strucni-stozer', element: <TeamPage /> },
      { path: 'kategorije/:kat?', element: <KategorijaPage /> },
      { path: 'kontakt', element: <ContactPage /> },
      { path: 'novosti', element: <NovostiPage /> },
      { path: 'utakmice', element: <UtakmicePage /> },
      { path: 'utakmice/:id', element: <UtakmicaDetaljPage /> },
      { path: 'momcad', element: <MomcadPage /> },
      { path: 'statistika', element: <StatistikaPage /> },
      { path: 'galerija', element: <GalleryPage /> },
      { path: 'postani-clan', element: <PostaniClanPage /> },
      { path: 'obavijesti', element: <ObavijestiPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
