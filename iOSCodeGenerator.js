var XojoNewCodeGenerator = function() {
	this.generate = function(context, requests, options) {
		for(var i in requests) {
			var request = requests[i];
		
			var client_code = [];
		
			if(request.name) {
				client_code[client_code.length] = "// " + request.name;
			}
			if (request.description != "") {
				client_code[client_code.length] = "// " + request.description;
			}
			client_code[client_code.length] = "";
		
			var vars = request.variables;
			if (vars.length > 0) {
				client_code[client_code.length] = "// Variable Definitions"
				for(i=0;i<vars.length;i++) {
					var desc = "// " + vars[i].name + ": " + vars[i].description;
					if (vars[i].required) {
						desc += " (required)";
					}
					client_code[client_code.length] = desc;
					client_code[client_code.length] = "// " + vars[i].type;
				}
				client_code[client_code.length] = "";
			}
		
			client_code[client_code.length] = "// Set up the socket";
			client_code[client_code.length] = "// \"mySocket\" should be a property stored elsewhere so it will not go out of scope before the request completes";
			client_code[client_code.length] = "// Property mySocket as Xojo.Net.HTTPSocket"
			client_code[client_code.length] = "mySocket = new Xojo.Net.HTTPSocket";		
			var headers = request.headers;
			for (var headerName in headers) {
				var headerValue = headers[headerName];
				if(!(request.body != "" && headerName == "Content-Type")) {
					client_code[client_code.length] = "mySocket.RequestHeader(\"" + headerName + "\") = \"" + headerValue + "\"";	
				}
			}
			client_code[client_code.length] = "";
		
			var body;
			var mimeType;
			// Figure out what kind of body the user specified
			if(request.multipartBody) {
				body = request.multipartBody;
				if(Object.size(body) > 0) {
					mimeType = "multipart/form-data";
					client_code[client_code.length] = "// Multipart";
					client_code[client_code.length] = "Dim textArr() as Text";
					for(var propertyName in body) {
						var key = propertyName;
						var value = body[key];
						client_code[client_code.length] = "textArr.append \"" + key + "=" + encodeURIComponent(value) + "\"";
					}
					client_code[client_code.length] = "Dim textData as Text = Text.Join(textArr,\"&\")";
					client_code[client_code.length] = "";
					client_code[client_code.length] = "// Convert Text to Memoryblock"
					client_code[client_code.length] = "Dim data As Xojo.Core.MemoryBlock = Xojo.Core.TextEncoding.UTF8.ConvertTextToData(textData)";
				}
			} else if(request.jsonBody) {
				body = request.jsonBody;		
				mimeType = "application/json";
				client_code[client_code.length] = "// JSON";
			
				var jsontext = JSON.stringify(body).replace(/\"/g,"\\\"");
				client_code[client_code.length] = "Dim json as Text = \"" + jsontext + "\"";
		
				client_code[client_code.length] = "";
				client_code[client_code.length] = "// Convert Text to Memoryblock"
				client_code[client_code.length] = "Dim data As Xojo.Core.MemoryBlock = Xojo.Core.TextEncoding.UTF8.ConvertTextToData(json)";
			} else if(request.urlEncodedBody) {
				body = request.urlEncodedBody;
				if(Object.size(body) > 0) {
					mimeType = "application/x-www-form-urlencoded";
					client_code[client_code.length] = "Dim textArr() as Text";
					for(var propertyName in body) {
						var key = propertyName;
						var value = body[key];
						client_code[client_code.length] = "textArr.append \"" + key + "=" + encodeURIComponent(value) + "\"";
					}
					client_code[client_code.length] = "Dim textData as Text = Text.Join(textArr,\"&\")";
					client_code[client_code.length] = "";
					client_code[client_code.length] = "// Convert Text to Memoryblock"
					client_code[client_code.length] = "Dim data As Xojo.Core.MemoryBlock = Xojo.Core.TextEncoding.UTF8.ConvertTextToData(textData)";
				}
			} else if(request.body) {
				if(request.body.length > 0) {
					var replaceCRLF = new RegExp('\n', 'g');
					var replaceQuotes = new RegExp('\"', 'g');
					body = request.body;
					//body = body.replace(replaceCRLF
					mimeType = "text/plain";
					// Some generic body data
					client_code[client_code.length] = "// Make an EOL object (CRLF)"
					client_code[client_code.length] = "Dim EOL as Text = Text.FromUnicodeCodepoint(13) + Text.FromUnicodeCodepoint(10)";
					client_code[client_code.length] = "";
					client_code[client_code.length] = "// Put raw data into a Text object";
					client_code[client_code.length] = "Dim textData as Text = \"" + body.replace(replaceQuotes,"\"\"").replace(replaceCRLF, "\" + EOL + \"") + "\"";
					client_code[client_code.length] = "";
					client_code[client_code.length] = "// Convert Text to Memoryblock";
					client_code[client_code.length] = "Dim data As Xojo.Core.MemoryBlock = Xojo.Core.TextEncoding.UTF8.ConvertTextToData(textData)";
				}
			}
		
			if(mimeType) {
				client_code[client_code.length] = "";
				client_code[client_code.length] = "// Assign to the Request's Content";
				client_code[client_code.length] = "mySocket.SetRequestContent(data,\"" + mimeType + "\")";
				client_code[client_code.length] = "";
			}
			client_code[client_code.length] = "// Set the URL";
			client_code[client_code.length] = "dim url as Text = \"" + request.url + "\"";
			client_code[client_code.length] = ""
			client_code[client_code.length] = "// Send Asynchronous Request"
			client_code[client_code.length] = "mySocket.Send(\"" + request.method + "\",url)";
			return client_code.join("\r");
		}
	}
}

XojoNewCodeGenerator.identifier = "com.xojo.PawExtensions.iOSCodeGenerator";

XojoNewCodeGenerator.title = "Xojo iOS Framework";

XojoNewCodeGenerator.fileExtension = "xojo_code";

registerCodeGenerator(XojoNewCodeGenerator);

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
