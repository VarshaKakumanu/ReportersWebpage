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

interface TestProps {
  onVideoUpload: (videoUrl: string) => void;
  onImageUpload: (imageUrl: string) => void;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Test: React.FC<TestProps> = ({ onVideoUpload, onImageUpload,setIsDialogOpen }) => {
  const [uppy, setUppy] = useState<Uppy | null>(null);
  const [s3_base_url, setS3_base_url] = useState("");
  const curtime = Math.ceil(Date.now() / 1000);
  const userDetails = useSelector((state: any) => state?.userDetails);
  const loginParams = useSelector((state: any) => state.loginParams);

  document.addEventListener("DOMContentLoaded", () => {
    const addMoreButton:any = document.querySelector(".uppy-DashboardContent-addMore");
    if (addMoreButton) {
      addMoreButton.style.display = "none";
    }
  });

  const createBasicAuthHeader = () => {
    const credentials = `${loginParams?.email}:${loginParams?.password}`;
    const encodedCredentials = btoa(credentials);
    return `Basic ${encodedCredentials}`;
  };

  const uploadImageToWP = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const authHeader = createBasicAuthHeader();
    try {
      const response = await axios.post(`${BASE_URL}wp/v2/media`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: authHeader,
        },
      });

      const imageUrl = response?.data?.source_url;
      onImageUpload(imageUrl); // Callback for image upload success
      // toast.success("Image uploaded successfully!");
    } catch (error: any) {
      toast.error("Error uploading image:", {
        description: error.message,
      });
    }
  };

  const makeMediaAPICall = (url: string) => {
    axios
      .get(
        `${BASE_URL}media/v1/path?user_id=${userDetails?.id}&file_url=${url}`
      )
      .catch((error) => {
        toast.error("Error fetching media details:", {
          description: error.message,
        });
      });
  };

  const calculateChunkSize = (fileSize: number): number => {
    {
      if (fileSize <= 50 * 1024 * 1024) { // Less than or equal to 50MB
          return 5  * 1024 * 1024; // 5MB
      } else if (fileSize <= 500  * 1024 * 1024) { // Between 50MB and 500MB
          return 25  * 1024 * 1024; // 25MB
      } else if (fileSize <= 2048  * 1024 * 1024) { // Between 500MB and 2GB
          return 50 * 1024 * 1024; // 50MB
      } else { // Greater than 2GB
          return 100 * 1024 * 1024; // 100MB
      }
  }
  
  };
  
  // Example usage in the component
  const fileSize = 10 * 1024 * 1024 * 1024; // 4GB
  

  useEffect(() => {
    const uppyInstance = new Uppy({
      debug: true,
      autoProceed: true,
      restrictions: {
        maxFileSize: fileSize, // 10GB
        allowedFileTypes: ["video/*", "image/*"],
      },
    });
  
    // Configure Dashboard Plugin
    uppyInstance.use(Dashboard, {
      inline: true,
      target: "#uppy-dashboard",
      showProgressDetails: true,
      proudlyDisplayPoweredByUppy: false,
    });
    
  
    // Configure Tus Plugin
    
    uppyInstance.use(Tus, {
      endpoint: `http://test.kb.etvbharat.com/wp-tus?curtime=${curtime}`,
      retryDelays: [0, 1000, 3000, 5000, 10000],
      chunkSize: undefined, // Set chunk size to 10MB
      
    });

        // Adjust chunk size dynamically on file addition
        uppyInstance.on("file-added", (file: any) => {
          const dynamicChunkSize = calculateChunkSize(file.size);
          console.log(
            `File: ${file.name}, Size: ${file.size / (1024 * 1024)} MB, Chunk Size: ${
              dynamicChunkSize / (1024 * 1024)
            } MB`
          );
          uppyInstance.getPlugin("Tus")?.setOptions({ chunkSize: dynamicChunkSize });
          
        });

        uppyInstance.on("upload-progress", (file: any, progress: any) => {
          console.log(
            `Progress for ${file.name}: Uploaded ${progress.bytesUploaded} of ${file.size}`
          );
        });
     // Retry Upload Logic
     const retryUpload = (fileId: string) => {
      const file = uppyInstance.getFile(fileId);
      if (file) {
        console.log(`Retrying upload for file: ${file.name}`);
        uppyInstance.retryUpload(fileId);
      }
    };

  
    // Success Event
    uppyInstance.on("complete", (result: any) => {
      result.successful.forEach((file: any) => {
        if (file.type.startsWith("image/")) {
          uploadImageToWP(file.data);
        } else if (file.type.startsWith("video/")) {
          const finalUploadedUrl = `http://chartbeat-datastream-storage.s3.ap-south-1.amazonaws.com/wp-content/uploads/2025/01/${curtime}/${file.name}`;
          onVideoUpload(finalUploadedUrl);
          makeMediaAPICall(finalUploadedUrl);
       
        }
      });
      setIsDialogOpen(false);
    });

    uppyInstance.on('upload-success', (result:any) => {
      console.log('successful files:', result.successful);
      console.log('failed files:', result.failed);
    });
  
    // Error Event
   // Error Event
   uppyInstance.on("upload-error", (file:any, error) => {
    console.error(`Upload failed for file: ${file.name}`, error);

    // Implement retry logic
    setTimeout(() => {
      retryUpload(file.id);
    }, 5000); // Retry after 5 seconds
  });

    
  
    setUppy(uppyInstance);
  
    // Cleanup
    return () => {
      if (uppyInstance) {
        // Cancel all uploads
        uppyInstance.cancelAll();
  
        // Uninstall plugins manually
        const dashboard = uppyInstance.getPlugin("Dashboard");
        if (dashboard) {
          uppyInstance.removePlugin(dashboard);
        }
  
        const tus = uppyInstance.getPlugin("Tus");
        if (tus) {
          uppyInstance.removePlugin(tus);
        }
  
        // Remove all event listeners
        uppyInstance.removeFile("complete");
        uppyInstance.removeFile("upload-error");
  
        // Set instance to null
        setUppy(null);
      }
    };
  }, [onVideoUpload, onImageUpload, curtime]);
  

  useEffect(() => {
    axios.get(`${BASE_URL}media/v1/path`).then((response) => {
      const S3Url = response?.data?.s3_base;
      setS3_base_url(S3Url);
    });
  }, []);

  return (
    <div className="flex flex-col items-center  h-[26rem] ">
      <div id="uppy-dashboard" className=" max-w-xl  w-[18rem] md:w-[40rem] lg:w-[52rem] z-10 "></div>
    </div>
  );
};

export default Test;
