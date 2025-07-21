import css from "./App.module.css";

import { useState, useEffect } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import ReactPaginate from "react-paginate";
import toast, { Toaster } from "react-hot-toast";

import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import MovieModal from "../MovieModal/MovieModal";

import { fetchMovies } from "../../services/movieService";
import type { Movie } from "../../types/movie";

export default function App() {
  const [query, setQuery] = useState(""); // поиск
  const [page, setPage] = useState(1); // пагинация
  const [isMovieModal, setIsMovieModal] = useState<Movie | null>(null);
  // null — нет выбора, Movie — выбран фильм

  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ["movies", query, page],
    queryFn: () => fetchMovies(query, page),
    enabled: query.trim() !== "",
    placeholderData: keepPreviousData,
  });

  const movies = data?.results;
  const totalPages = data?.total_pages;

  const handleSearch = async (query: string) => {
    setQuery(query);
    setPage(1);
  };

  useEffect(() => {
    if (query.trim() !== "" && movies && movies.length === 0) {
      toast.error("No movies found for your request.");
    }
  }, [movies, query]);

  const openMovieModal = (movie: Movie) => {
    setIsMovieModal(movie);
  };
  const closeMovieModal = () => {
    setIsMovieModal(null);
  };

  return (
    <div className={css.app}>
      <Toaster position="top-center" />

      <SearchBar onSubmit={handleSearch} />

      {totalPages && totalPages > 1 && (
        <ReactPaginate
          pageCount={totalPages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={1}
          onPageChange={({ selected }) => {
            if (!isLoading) setPage(selected + 1);
          }}
          forcePage={page - 1}
          containerClassName={css.pagination}
          activeClassName={css.active}
          disabledClassName={css.disabled}
          previousLabel="←"
          nextLabel="→"
        />
      )}

      {isLoading && <Loader />}
      {isError && <ErrorMessage />}

      {/* MovieGridProps={переменная состояния} */}
      {isSuccess && movies && data && (
        <MovieGrid movies={movies} onSelect={openMovieModal} />
      )}

      {/* выбранный фильм && показать модалку
      MovieModalProps={переменная состояния} */}
      {isMovieModal && (
        <MovieModal movie={isMovieModal} onClose={closeMovieModal} />
      )}
    </div>
  );
}
