import { useState, useEffect } from "react";
import API from "../api";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";

function Home({ onLogout }) {

//   return (
//     <div>
//       <h1>Welcome to the Home Page</h1>
//       <p>You are logged in!</p>
//       <button onClick={onLogout}>Logout</button>
//     </div>
//   );
// }

  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts");
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Community Feed</h2>
        <button onClick={onLogout}>Logout</button>
      </div>
      <CreatePost onCreated={fetchPosts} />
      <div>
        {posts.map(post => (
          <PostCard key={post._id} post={post} onUpdate={fetchPosts} />
        ))}
      </div>
    </div>
  );
}

export default Home;