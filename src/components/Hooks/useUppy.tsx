import { useEffect, useState } from "react";
import Uppy from "@uppy/core";
import Tus from "@uppy/tus";
import Dashboard from "@uppy/dashboard";
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";

const useUppy = (options: any) => {
  const [uppy, setUppy] = useState<Uppy | null>(null);

  useEffect(() => {
    const uppyInstance = new Uppy(options);

    // Add plugins
    uppyInstance
      .use(Dashboard, {
        inline: true,
        target: options.target,
        showProgressDetails: true,
        proudlyDisplayPoweredByUppy: true,
      })
      .use(Tus, { endpoint: options.endpoint });

    setUppy(uppyInstance);

    // Cleanup function for Uppy instance
    return () => {
      uppyInstance.reset();
    };
  }, [options]);

  return uppy;
};
