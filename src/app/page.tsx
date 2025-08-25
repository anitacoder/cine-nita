"use client";
import { useEffect, useState } from "react";
import "./globals.css";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import MovieIcon from "@mui/icons-material/Movie";


type Movie = {
  id: number;
  title: string;
  vote_average: number;
  poster_path: string | null;
  overview: string;
  release_date: string;
  genre_ids: number[];
};

const genres = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 878, name: "Sci-Fi" },
];

const tabs = [
  { key: "popular", label: "Popular" },
  { key: "top_rated", label: "Top Rated" },
  { key: "trending", label: "Trending" },
];

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [modalMovie, setModalMovie] = useState<Movie | null>(null);
  const [activeTab, setActiveTab] = useState<string>("popular");

  const getMovies = async (pageNumber: number, genreId?: number) => {
    setLoading(true);
    try {
      let url = "";
      const genreQuery = genreId ? `&with_genres=${genreId}` : "";

      if (searchTerm) {
        url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(
          searchTerm
        )}&page=${pageNumber}`;
      } else if (activeTab === "trending") {
        url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&page=${pageNumber}`;
      }else if (genreId) {
        url = `https://api.themoviedb.org/3/discover/movie?api_key=${
          process.env.NEXT_PUBLIC_TMDB_API_KEY
        }&with_genres=${genreId}&sort_by=popularity.desc&page=${pageNumber}`;
      } else if (activeTab === "popular") {
        url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${
          process.env.NEXT_PUBLIC_TMDB_API_KEY
        }&page=${pageNumber}`;
      } else if (activeTab === "top_rated") {
        url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US&page=${pageNumber}${genreQuery}`;
      } else {
        url = `https://api.themoviedb.org/3/movie/${activeTab}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US&page=${pageNumber}${genreQuery}`;
      } 

      const res = await fetch(url);
      const data = await res.json();
      setMovies((prev) => (pageNumber === 1 ? data.results : [...prev, ...(data.results || [])]));
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMovies([]);
    setPage(1);
    getMovies(1, selectedGenre || undefined);
  }, [selectedGenre, searchTerm, activeTab]);

  useEffect(() => {
    if (page > 1) getMovies(page, selectedGenre || undefined);
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
        !loading
      ) {
        setPage((prev) => prev + 1);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading]);

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
      <nav className="navbar">
      <div className="logo-container flex items-center gap-2">
    <MovieIcon fontSize="large" />
    <h1 className="logo">CineNita</h1>
  </div>
    <div className="search-container">
          <input
            type="text"
            placeholder="Search movies..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => setDarkMode(!darkMode)} className="toggle-btn">{darkMode ? <ToggleOnIcon fontSize="large" /> : <ToggleOffIcon fontSize="large" />}</button>
      </nav>

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="genres">
        <button
          onClick={() => setSelectedGenre(null)}
          className={`genre-btn ${selectedGenre === null ? "active" : ""}`}
        >
          All
        </button>
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => setSelectedGenre(genre.id)}
            className={`genre-btn ${selectedGenre === genre.id ? "active" : ""}`}
          >
            {genre.name}
          </button>
        ))}
      </div>

      <main className="movies">
        <div className="grid">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="movie-card"
              onClick={() => setModalMovie(movie)}
            >
              <img
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : "/placeholder.png"
                }
                alt={movie.title}
                className="movie-img"
              />
              <div className="overlay">
                <h2>{movie.title}</h2>
                <p>⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</p>
                </div>
            </div>
          ))}
        </div>

        {loading && (
          <p className="loading">Loading more movies...</p>
        )}
      </main>

      {modalMovie && (
        <div
          className="modal-bg"
          onClick={() => setModalMovie(null)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-btn"
              onClick={() => setModalMovie(null)}
            >
              &times;
            </button>
            <img
              src={
                modalMovie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${modalMovie.poster_path}`
                  : "/placeholder.png"
              }
              alt={modalMovie.title}
              className="modal-img"
            />
            <div className="modal-content">
              <h2>{modalMovie.title}</h2>
              <p className="rating">⭐ {modalMovie.vote_average.toFixed(1)}</p>
              <p className="release">Release: {modalMovie.release_date}</p>
              <p className="overview">{modalMovie.overview}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
