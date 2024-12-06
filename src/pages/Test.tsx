import React, { useState, useEffect } from "react";
import Uppy from "@uppy/core";
import Tus from "@uppy/tus";
import Dashboard from "@uppy/dashboard";
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import { BASE_URL } from "@/config/app";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "sonner";

const Test = () => {
  const [uppy, setUppy] = useState<Uppy | null>(null);
  const [s3_base_url, setS3_base_url] = useState("");
  const curtime = Math.ceil(Date.now() / 1000);
  const userDetails = useSelector((state: any) => state?.userDetails);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);



  const makeMediaAPICall = (url: string) => {
    axios
      .get(
        `${BASE_URL}media/v1/path?file_url=` +
          url +
          "&user_id=" +
          userDetails?.id.toString()
      )
      .catch((error) => {
        toast.error("Error fetching articles:", {
          description: error.message,
        });
      });
  };

  useEffect(() => {
    if (!uppy) {
        setVideoUrl(null);
      // Initialize Uppy instance only once
      const uppyInstance = new Uppy({
        debug: true,
        autoProceed: false,
        restrictions: {
          maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB
          allowedFileTypes: ["video/*", "image/*", "audio/*"],
        },
      })
        .use(Dashboard, {
          inline: true,
          target: "#uppy-dashboard", // Ensures only one dashboard is mounted
          showProgressDetails: true,
          proudlyDisplayPoweredByUppy: true,
        })
        .use(Tus, {   endpoint: "http://test.kb.etvbharat.com/wp-tus?curtime=" + curtime,});

      // On upload success
      uppyInstance.on("complete", (result: any) => {
            
       
        console.log("Upload complete! Successful files:", result.successful);

        result.successful.forEach((file: any) => {
            console.log("hey",s3_base_url)
          const final_uploaded_url = `http://chartbeat-datastream-storage.s3.ap-south-1.amazonaws.com/wp-content/uploads/2024/12/${curtime}/${file.name}`;
          
          setVideoUrl(final_uploaded_url);
          console.log("Final Uploaded URL:", final_uploaded_url);
          makeMediaAPICall('http://chartbeat-datastream-storage.s3.ap-south-1.amazonaws.com/wp-content/uploads/2024/12/'+curtime+'/'+file.name);
        });
      });

      // Handle upload errors
      uppyInstance.on("upload-error", (file: any, error) => {
        console.error(`Error uploading file ${file.name}:`, error);
      });

      setUppy(uppyInstance);

      return () => {
        // Clean up on unmount
              uppyInstance.clear();

        uppyInstance.cancelAll(); // Cancels any ongoing uploads
      };
    }
  }, [uppy, s3_base_url, curtime]);


  useEffect(() => {
    // Fetch base S3 URL
    axios.get(`${BASE_URL}media/v1/path`).then((response) => {
      const S3Url = response?.data?.s3_base;
     
      setS3_base_url(S3Url);
    });
  }, [videoUrl]);
  return (
    <div className="flex flex-col items-center">
      <h1>ETV Bharat File Upload</h1>
      <div id="uppy-dashboard" className="w-full max-w-3xl mt-4 bg-pink-600"></div>
    </div>
  );
};



export default Test;
