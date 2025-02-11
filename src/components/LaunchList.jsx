import React, { useState, useEffect } from "react";
import axios from "axios";
import Loading from "./Loading";

const LaunchList = () => {
    const [launches, setLaunches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState("");
    const [expandedCard, setExpandedCard] = useState(null);

    useEffect(() => {
        if (!searchLoading) fetchLaunches(page, search);
    }, [page]);

    useEffect(() => {
        setPage(1);
        setHasMore(true);
        if (search) {
            handleSearch();
        }
    }, [search]);

    const fetchLaunches = async (page, searchTerm) => {
        setLoading(true);
        try {
            const response = await axios.get(`https://api.spacexdata.com/v3/launches`, {
                params: {
                    limit: 10,
                    offset: (page - 1) * 10,
                },
            });

            const fetchedLaunches = response.data.filter((launch) =>
                launch.mission_name.toLowerCase().includes(searchTerm.toLowerCase())
            );

            setLaunches((prev) => (page === 1 ? fetchedLaunches : [...prev, ...fetchedLaunches]));
            if (fetchedLaunches.length < 10) setHasMore(false);
        } catch (error) {
            console.error("Error fetching launches", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setSearchLoading(true);
        try {
            const response = await axios.get(`https://api.spacexdata.com/v3/launches`);
            const filteredLaunches = response.data.filter((launch) =>
                launch.mission_name.toLowerCase().includes(search.toLowerCase())
            );
            setLaunches(filteredLaunches);
            setHasMore(filteredLaunches.length > 10);
        } catch (error) {
            console.error("Error fetching search results", error);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleScroll = () => {
        if (
            window.innerHeight + document.documentElement.scrollTop >=
            document.documentElement.offsetHeight - 200
        ) {
            if (!loading && hasMore) {
                setPage((prevPage) => prevPage + 1);
            }
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [loading, hasMore]);

    const toggleCardExpansion = (flightNumber) => {
        setExpandedCard((prev) => (prev === flightNumber ? null : flightNumber));
    };

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
            <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={handleSearchChange}
                style={{
                    width: "100%",
                    padding: "10px",
                    marginBottom: "10px",
                    boxSizing: "border-box",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                }}
            />
            <div>
                {searchLoading ? (
                    <p style={{ textAlign: "center" }}>Searching...</p>
                ) : (
                    launches.map((launch) => (
                        <div
                            key={launch.flight_number}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                marginBottom: "10px",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                backgroundColor: "#fff",
                                overflow: "hidden",
                                transition: "all 0.3s ease",
                                padding: expandedCard === launch.flight_number ? "15px" : "15px 15px 0 15px",
                                height: expandedCard === launch.flight_number ? "auto" : "120px",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <h2 style={{ fontSize: "18px", margin: "0", fontWeight: "bold" }}>
                                    {launch.mission_name}
                                </h2>
                                <span
                                    style={{
                                        backgroundColor: launch.upcoming
                                            ? "#17a2b8"
                                            : launch.launch_success
                                                ? "#28a745"
                                                : "#dc3545",
                                        color: "#fff",
                                        padding: "2px 8px",
                                        borderRadius: "4px",
                                        fontSize: "12px",
                                    }}
                                >
                  {launch.upcoming
                      ? "upcoming"
                      : launch.launch_success
                          ? "success"
                          : "failed"}
                </span>
                            </div>
                            <div style={{ marginTop: "10px" }}>
                                <button
                                    onClick={() => toggleCardExpansion(launch.flight_number)}
                                    style={{
                                        backgroundColor: "#007bff",
                                        color: "#fff",
                                        padding: "8px 12px",
                                        borderRadius: "4px",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                    }}
                                >
                                    {expandedCard === launch.flight_number ? "COLLAPSE" : "VIEW"}
                                </button>
                            </div>
                            {expandedCard === launch.flight_number && (
                                <div style={{ marginTop: "10px" }}>
                                    <p>
                                        <strong>Rocket:</strong> {launch.rocket.rocket_name}
                                    </p>
                                    <p>
                                        <strong>Launch Date:</strong>{" "}
                                        {new Date(launch.launch_date_utc).toLocaleString()}
                                    </p>
                                    <p>
                                        <strong>Launch Site:</strong> {launch.launch_site.site_name_long}
                                    </p>
                                    {launch.links.mission_patch_small && (
                                        <img
                                            src={launch.links.mission_patch_small}
                                            alt={`${launch.mission_name} patch`}
                                            style={{ maxWidth: "100px", marginBottom: "10px" }}
                                        />
                                    )}
                                    {(launch.links.video_link || launch.links.article_link) && (
                                        <p>
                                            {launch.links.video_link && (
                                                <a
                                                    href={launch.links.video_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: "#007bff", textDecoration: "underline" }}
                                                >
                                                    Video
                                                </a>
                                            )}
                                            {launch.links.article_link && (
                                                <>
                                                    {launch.links.video_link && " | "}
                                                    <a
                                                        href={launch.links.article_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: "#007bff", textDecoration: "underline" }}
                                                    >
                                                        Article
                                                    </a>
                                                </>
                                            )}
                                        </p>
                                    )}

                                    <p>{launch.details || "No details available."}</p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
            {loading && !searchLoading && <Loading />}
            {!hasMore && !loading && !searchLoading && (
                <div style={{ textAlign: "center", margin: "20px" }}>
                    <p>End of List</p>
                </div>
            )}
        </div>
    );
};

export default LaunchList;
