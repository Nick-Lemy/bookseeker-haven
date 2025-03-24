
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

const Index = () => {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchInputRef = useRef(null);

  // Animation refs
  const headerRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }

    // Initial animations
    const header = headerRef.current;
    const search = searchRef.current;
    
    if (header) {
      header.style.opacity = '0';
      header.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        header.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        header.style.opacity = '1';
        header.style.transform = 'translateY(0)';
      }, 100);
    }
    
    if (search) {
      search.style.opacity = '0';
      search.style.transform = 'translateY(20px)';
      setTimeout(() => {
        search.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        search.style.opacity = '1';
        search.style.transform = 'translateY(0)';
      }, 300);
    }
  }, []);

  const searchBooks = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.docs && data.docs.length > 0) {
        setBooks(data.docs);
        
        // Save to recent searches
        const newSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
        setRecentSearches(newSearches);
        localStorage.setItem("recentSearches", JSON.stringify(newSearches));
        
        toast.success(`Found ${data.numFound} books`);
      } else {
        setBooks([]);
        toast.error("No books found");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("An error occurred while searching");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      searchBooks();
    }
  };

  const handleBookClick = (book) => {
    setSelectedBook(book);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const closeBookDetails = () => {
    setSelectedBook(null);
  };

  const handleRecentSearchClick = (term) => {
    setQuery(term);
    searchInputRef.current.focus();
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-neutral-50 z-0"></div>
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div ref={headerRef} className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-4 px-3 py-1 bg-blue-100 bg-opacity-70 rounded-full backdrop-blur-sm">
              <span className="text-blue-800 text-sm font-medium">Open Library Explorer</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light mb-4 text-gray-900 tracking-tight">
              Discover the world of <span className="font-normal">literature</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Explore millions of books from the Open Library database with a clean, intuitive interface.
            </p>
          </div>

          {/* Search Section */}
          <div ref={searchRef} className="max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative flex bg-white rounded-lg shadow-sm overflow-hidden">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search for books, authors, or subjects..."
                  className="flex-grow px-4 py-3 focus:outline-none text-gray-800"
                />
                <button
                  onClick={searchBooks}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center text-sm">
                <span className="text-gray-500 mr-2">Recent:</span>
                {recentSearches.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(term)}
                    className="mr-2 mb-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 text-xs transition-colors duration-200"
                  >
                    {term}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Book Details Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="animate-in fade-in zoom-in duration-300 bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">
                  {selectedBook.title}
                </h2>
                <button 
                  onClick={closeBookDetails}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 w-full md:w-1/3">
                  <div className="aspect-[2/3] bg-gray-100 rounded-lg overflow-hidden">
                    {selectedBook.cover_i ? (
                      <img
                        src={`https://covers.openlibrary.org/b/id/${selectedBook.cover_i}-L.jpg`}
                        alt={selectedBook.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-400">No cover available</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-grow">
                  {selectedBook.author_name && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Author</h3>
                      <p className="text-gray-900">{selectedBook.author_name.join(', ')}</p>
                    </div>
                  )}
                  
                  {selectedBook.first_publish_year && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">First Published</h3>
                      <p className="text-gray-900">{selectedBook.first_publish_year}</p>
                    </div>
                  )}
                  
                  {selectedBook.publisher && selectedBook.publisher.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Publisher</h3>
                      <p className="text-gray-900">{selectedBook.publisher.slice(0, 3).join(', ')}</p>
                    </div>
                  )}
                  
                  {selectedBook.subject && selectedBook.subject.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Subjects</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedBook.subject.slice(0, 5).map((subject, index) => (
                          <span key={index} className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <a
                      href={`https://openlibrary.org${selectedBook.key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      View on Open Library
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="ml-2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {books.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-medium mb-8 text-gray-800 text-center">
            Search Results
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book, index) => (
              <div
                key={index}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer animate-in fade-in-50 slide-in-from-bottom-5 duration-300"
                style={{ animationDelay: `${index * 30}ms` }}
                onClick={() => handleBookClick(book)}
              >
                <div className="aspect-[2/3] bg-gray-100 relative overflow-hidden">
                  {book.cover_i ? (
                    <img
                      src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400">No cover</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                    {book.title}
                  </h3>
                  {book.author_name && (
                    <p className="text-sm text-gray-600">
                      {book.author_name[0]}
                      {book.author_name.length > 1 && " et al."}
                    </p>
                  )}
                  {book.first_publish_year && (
                    <p className="text-xs text-gray-500 mt-1">
                      {book.first_publish_year}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>Data provided by <a href="https://openlibrary.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Open Library</a></p>
            <p className="mt-2">Created for educational purposes only</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
