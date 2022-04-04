import React from "react";
import ThreadList from "../components/thread/ThreadList";

const HomePage = () => {
    return (
        <>
            <ThreadList favorites={0} />
        </>
    );
};

export default HomePage;
