import { useEffect, useState } from "react";
import API from "../api";

function Home(){
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await API.get("/posts");
            console.log("Posts:", res.data);
            setPosts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h2>Feed</h2>
            {posts.map(post => (
                <div key={post._id}>
                    <h3>{post.title}</h3>
                    <p>{post.content}</p>
                    <p>Votes: {post.votes}</p>
                </div>
            ))}
        </div>
    );
}

export default Home;

// function Home() {
//   return <h1>HOME WORKING</h1>;
// }

// export default Home;