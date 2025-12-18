import { useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import ProfilePage from "./ProfilePage";
import UserProfilePage from "./UserProfilePage";

export default function ProfileRoutePage() {
  const { username } = useParams();
  const { user: authUser } = useAuth();

  const isMe = authUser?.username === username;

  return isMe ? <ProfilePage /> : <UserProfilePage />;
}
