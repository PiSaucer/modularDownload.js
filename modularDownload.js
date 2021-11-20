/**
 * License: MIT
 *    See LICENSE.md
 * @required FileSaver.js, jszip.js, jszip-utils.js, jquery-3.5.1.min.js, bootstrap.min.js
 * @summary short description for the file
 * @desc long description for the file
 * @author PiSaucer <pisaucer@gmail.com>
 *
 * Created at     : 2021-11-05 09:42:00 
 * Last modified  : 2021-11-05 09:42:00
 */

jQuery(function($) {

    var Promise = window.Promise;
    if (!Promise) {
        Promise = JSZip.external.Promise;
    }

    /**
     * Fetch the content and return the associated promise.
     * @param {String} url the url of the content to fetch.
     * @return {Promise} the promise containing the data.
     */
    function urlToPromise(url) {
        return new Promise(function(resolve, reject) {
            JSZipUtils.getBinaryContent(url, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    /**
     * Fetch the content and return the associated promise.
     * @param {on click}
     * @return {Promise} the promise containing the data.
     */
    $(".btn").on('click', function() {
        let fileType = $(this).attr("value");
        var fileName = "example";

        $("#download_form").click("submit", function() {

            //Restart and Create New JSZip object
            resetMessage();
            var zip = new JSZip();

            // find every checked item
            $(this).find(":checked").each(function() {
                var $this = $(this);

                function filePerPack(length) {
                    for (var i = 1; i < length; i++) {
                        var url = $this.data("url" + [i]);
                        var dataFolder = $this.data("folder" + [i]);
                        var folder = zip.folder(dataFolder);
                        var filename = url.replace(/.*\//g, "");
                        var result = folder.file(filename, urlToPromise(url), {
                            binary: true
                        });
                    }
                    return result;
                }

                var amount = $this.data("amount");
                filePerPack(amount + 1);
            });

            //when everything has been downloaded, we can trigger the download
            zip.generateAsync({
                    type: "blob"
                }, function updateCallback(metadata) {
                    var msg = "progress: " + metadata.percent.toFixed(2) + "%";
                    if (metadata.currentFile) {
                        msg += " | adding: " + metadata.currentFile;
                    }
                    showMessage(msg);
                    updatePercent(metadata.percent | 0);
                })
                .then(function callback(blob) {

                        //see FileSaver.js

                        function makeid(length) {
                            var result = '';
                            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                            var charactersLength = characters.length;
                            for (var i = 0; i < length; i++) {
                                result += characters.charAt(Math.floor(Math.random() * charactersLength));
                            }
                            return result;
                        }

                        var packID = makeid(5);

                        //Edit File Name
                        saveAs(blob, fileName + "_" + packID + "." + fileType);

                        //Message For User
                        showMessage("Thank you for downloading 😊");

                        $("#download_form").off();
                    },
                    function(e) {
                        showError(e);
                    });

            return false;
        });
    });

    //UI Changes to alert User

    /**
     * Reset the message.
     */
    function resetMessage() {
        $("#result").removeClass().text("");
    }

    /**
     * show a successful message.
     * @param {String} text the text to show.
     */
    function showMessage(text) {
        resetMessage();
        $("#result")
            .addClass("alert alert-success")
            .text(text);
    }

    /**
     * show an error message.
     * @param {String} text the text to show.
     */
    function showError(text) {
        resetMessage();
        $("#result")
            .addClass("alert alert-danger")
            .text(text);
    }

    /**
     * Update the progress bar.
     * @param {Integer} percent the current percent
     */
    function updatePercent(percent) {
        $("#progress_bar").removeClass("hide")
            .find(".progress-bar")
            .attr("aria-valuenow", percent)
            .css({
                width: percent + "%"
            });
    }

    if (!JSZip.support.blob) {
        showError("This works only with a modern browser !");
        return null;
    }

});