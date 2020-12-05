English | [简体中文](./README.zh-CN.md)

<h1 align="center">
  <br>
    <img src="./images/icon.png" alt="logo" width="200">
  <br><br>
  Facility
  <br>
  <br>
</h1>

  <p align="center">
    <a
      href="https://marketplace.visualstudio.com/items?itemName=sillyy.facility"
      ><img
        src="https://vsmarketplacebadge.apphb.com/version-short/sillyy.facility.svg?style=for-the-badge&colorA=61a1ff&colorB=3a8aff&label=VERSION"
        alt="Version" /></a
    >&nbsp;
    <a
      href="https://marketplace.visualstudio.com/items?itemName=sillyy.facility"
      ><img
        src="https://vsmarketplacebadge.apphb.com/installs-short/sillyy.facility.svg?style=for-the-badge&colorA=9383ff&colorB=7864ff&label=Installs"
        alt="Installs" /></a
    >&nbsp;
    <a
      href="https://marketplace.visualstudio.com/items?itemName=sillyy.facility"
      ><img
        src="https://vsmarketplacebadge.apphb.com/downloads-short/sillyy.facility.svg?style=for-the-badge&colorA=e550ff&colorB=df24ff&label=Downloads"
        alt="Downloads"
    /></a>
  </p>

## Quick Start

- Click "Shop Icon" on Activity Bar of VS Code

- Enter "facility" in the input box to search

- Click the Install button on the first facility option

  ![install demo](./docs/install_demo.jpg)

After installation is successful, click the "Facility icon" on Activity Bar of VS Code to start:

![open](./docs/open.jpg)

## **Features**

### Visual operation

Operate code snippet visually

### New Snippet
![save snippet](./docs/save_snippet.jpg)

1. Select the code snippet to be stored

2. Press `⇧⌘P` (MacOS) or `Ctrl+Shift+P` (Windows), input `Facility: Save Snippet` to open the selector panel

   Or : 

   Click the save icon on the right side of the tab bar to open the selector panel

3. Choose Save As or a file name and save to the local repository

### Show function outline

![display outline](./docs/display_outline.jpg)

1. Open the Explorer
2. Click Explorer to show the outline view

### Insert Snippet

#### Visualize inserts

![insert snippet](./docs/insert_snippet.jpg)

1. Place the input anchor at the specified position

2. Double-click 「Explorer」 to insert all the contents of the file

   Or :  

   Click「Outline」 to insert the specified function Snippet

#### Imperative insert

##### Configure keywords

![set config](./docs/set_config.jpg)

1. Press `⇧⌘P` (MacOS) or `Ctrl+Shift+P` (Windows), input `Preferences: Open Settings (json)` to open the configuration panel
2. Configure `facility.keyword` in the form of 「keyword-path」

##### Paste Snippet

![paste snippet1](./docs/paste_snippet1.jpg)

![paste snippet2](./docs/paste_snippet2.jpg)

![paste snippet3](./docs/paste_snippet3.jpg)

1. Use `⇧⌘P` (MacOS) or `Ctrl+Shift+P` (Windows) to call up the command panel, enter `Facility: Paste Fragment` to open the keyword input panel
2. Enter keywords and press Enter to confirm


### Open Repository
![open repository](./docs/open_repository.jpg)

Use `⇧⌘P` (MacOS) or `Ctrl + Shift + P` (Windows) to call up the command panel, enter `Facility: Open Repository` to open the Repository window

   Or :  

Click「Open Repository」 to open the Repository window

## FAQ

<details>
<summary>Sometimes I click the "Explorer" tree list, why doesn't the outline appear</summary>
The interface for obtaining the outline list is provided by VSCode, and the API call can only be used after the VSCode core module is loaded.
<br/>
It is recommended to restart the application or click several times to manually trigger the VSCode core module loading
</details>


## License

[MIT](LICENSE)


