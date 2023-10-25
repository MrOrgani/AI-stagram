import React, { useEffect, useState } from "react";
import useAuthStore from "../store/authStore";
import { PostType, User } from "../@/lib/types";

import ProfilePost from "../@/components/ProfilePost";
import { ProfileHeader } from "../@/components/ProfileHeader";
import { Icons } from "../@/components/ui/icons";
import { Link, useParams } from "react-router-dom";
import supabase from "../supabase";
import { Button } from "../@/components/ui/button";
import { ProfilePostDialogTriggerSkeleton } from "../@/components/ProfilePostDialogTriggerSkeleton";

const ProfileHeaderSkeleton = () => {
  return (
    <header className="flex h-[182px]">
      <div className="rounded-full mr-7 flex justify-center grow-[1] items-center ">
        <div className="flex ">
          <div className="w-[150px] h-[150px] bg-gray-300 rounded-full"></div>
        </div>
      </div>
      <section className="grow-[2] flex flex-col mt-4">
        <div className="font-normal text-xl mb-5">
          <div className="w-24 h-4 bg-gray-300 rounded-full mb-2.5"></div>
          <div className="w-32 h-4 bg-gray-300 rounded-full"></div>
        </div>
        <div className="text-base">
          <div className="w-16 h-4 bg-gray-300 rounded-full"></div>
        </div>
      </section>
    </header>
  );
};

const Profile = () => {
  const { userProfile } = useAuthStore();
  const [currentUserProfile, setCurrentUserProfile] = useState<User | null>(
    null
  );
  const [currentUserPosts, setCurrentUserPosts] = useState<PostType[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const { id: userId } = useParams();

  const postChannel = supabase
    .channel("posts")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "posts" },
      async (payload) => {
        if (payload.new.user_id === userProfile?.id) {
          try {
            const { data: newPost } = await supabase
              .from("posts")
              .select(
                `*,
              user:user_id (*,id:user_id),
              likedByUser:likes(id:user_id)
              `
              )
              .eq("id", payload.new.id)
              .single();
            setCurrentUserPosts([newPost, ...currentUserPosts]);
          } catch (err) {
            console.log(err);
          }
        }
      }
    )
    .subscribe();

  useEffect(() => {
    if (!userId) {
      return;
    }
    const fetchUserProfile = async () => {
      const { data: userProfile, error: userError } = await supabase
        .from("profiles")
        .select(
          `
        *, 
        posts(*,likedByUser:likes(id:user_id))
        `
        )
        .eq("user_id", userId)
        .single();

      if (userError) {
        console.error(userError);
        return;
      }

      setCurrentUserProfile(userProfile);

      const userPosts = userProfile?.posts ?? [];
      setIsLoading(false);
      setCurrentUserPosts(
        userPosts.sort((a: PostType, b: PostType) =>
          b.created_at.localeCompare(a.created_at)
        )
      );
    };

    fetchUserProfile();
    return () => {
      supabase.removeChannel(postChannel);
    };
  }, [userId]);

  if (!currentUserProfile) {
    return (
      <main className="py-6 px-4 mx-auto min-w-[320px] max-w-[832px] ">
        <div className="mt-20 h-full">
          <ProfileHeaderSkeleton />

          <div className="border-t border-[#dbdbdb] flex justify-center">
            <a className="flex items-center uppercase h-[52px]">
              <Icons.grid />
              <span className="ml-1.5 text-xs font-semibold tracking-wide">
                posts
              </span>
            </a>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {isLoading &&
              new Array(4)
                .fill(0)
                .map((_, i) => <ProfilePostDialogTriggerSkeleton key={i} />)}
          </div>
        </div>
      </main>
    );
  }

  const isMyProfile = userProfile?.id === userId;

  return (
    <main className="py-6 px-4 mx-auto min-w-[320px] max-w-[832px] ">
      <div className="mt-20 h-full">
        <ProfileHeader
          {...{
            user: currentUserProfile,
            nbOfPosts: currentUserPosts.length,
          }}
        >
          {isMyProfile && (
            <Link to={`/${userProfile?.id}/edit`}>
              <Button className="text-sm font-semibold text-black bg-gray-200 ml-5 px-2 h-8 hover:bg-gray-300">
                Edit Profile
              </Button>
            </Link>
          )}
        </ProfileHeader>
        <div className="border-t border-[#dbdbdb] flex justify-center">
          <a className="flex items-center uppercase h-[52px]">
            <Icons.grid />
            <span className="ml-1.5 text-xs font-semibold tracking-wide">
              posts
            </span>
          </a>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {currentUserPosts.map((post) => (
            <ProfilePost
              currentUserProfile={currentUserProfile}
              key={post.id}
              post={post}
            />
          ))}
        </div>
      </div>
    </main>
  );
};
export default Profile;
