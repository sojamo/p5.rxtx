# Notes for current and further development

To develop this library there are 2 modes: dev and build; dev-mode (npm run dev) will start a webserver at http://localhost:5173 to test the examples. Changes to the library itself are only recognised when the project is built (npm run build).

## Versions

### dev-0.1

- This version allows for micro-controllers like the Arduino and any other device that can speak serial communcation over a serial port to connect to a p5.js sketch when the library is available. Communication is established via a Serial-to-USB connection. We are currently able to detect one device to which we can automatically reconnect after reloading the sketch until the USB connection is lost. 


### dev-0.2

- Improve error messages and notifications. Currently these messages are printed to the console but should be visible to the user on canvas. 
- manage to handle multiple devices 


## CDN

1. Repository must be public 
2. Merge your-dev-branch with main 

   ```
   git checkout main
   git merge <your-dev-branch>
   ```
3. Tag the main branch 
   
   ```
   git tag v0.2.1
   git push origin v0.2.1
   ```

   This tags the current state of `main` as `v0.2.1`

4. Access p5.rxtx via jsDelivr which will use the tag when referencing or uses the latest version if indicated

   ```
   https://cdn.jsdelivr.net/gh/sojamo/p5.rxtx@latest/lib/p5.rxtx.min.js
   ```
5. Now continue on a new branch

   ```
   git checkout -b <your-new-dev-branch>
   ```

