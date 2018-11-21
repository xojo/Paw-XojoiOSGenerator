var XojoNewCodeGenerator = function() {
	this.generate = function(context) {
		var request = context.getCurrentRequest();
		
		var client_code = [];
		
		client_code[client_code.length] = "// " + request.name;
		client_code[client_code.length] = "";
		client_code[client_code.length] = "// Set up the socket";
		client_code[client_code.length] = "// \"mySocket\" should be a property/object stored elsewhere so it will not go out of scope";
		client_code[client_code.length] = "mySocket = New Xojo.Net.HTTPSocket";		
		var headers = request.headers;
		for (var headerName in headers) {
			var headerValue = headers[headerName];
			client_code[client_code.length] = "mySocket.RequestHeader(\"" + headerName + "\") = \"" + headerValue + "\"";	
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
				client_code[client_code.length] = "Dim textArr() As Text";
				for(var propertyName in body) {
					var key = propertyName;
					var value = body[key];
					client_code[client_code.length] = "textArr.append \"" + key + "=" + encodeURIComponent(value) + "\"";
				}
				client_code[client_code.length] = "Dim textData As Text = Text.Join(textArr,\"&\")";
				client_code[client_code.length] = "";
				client_code[client_code.length] = "// Convert Text to Memoryblock"
				client_code[client_code.length] = "Dim data As Xojo.Core.MemoryBlock = Xojo.Core.TextEncoding.UTF8.ConvertTextToData(textData)";
			}
		} else if(request.jsonBody) {
			body = request.jsonBody;
			if(Object.size(body) > 0) {
				mimeType = "application/json";
				client_code[client_code.length] = "// JSON"
				client_code[client_code.length] = "Dim d As New Dictionary"
				for(var propertyName in body) {
					var key = propertyName;
					var value = body[key];
					if(typeof value == "string") {
						value = "\"" + value + "\"";
					} else if(value == null) {
						value = "nil";
					} 
					client_code[client_code.length] = "d.Value(\"" + key + "\") = " + value;
				}
				client_code[client_code.length] = "";
				client_code[client_code.length] = "// Convert Dictionary to JSON Text"
				client_code[client_code.length] = "Dim json As Text = Xojo.Data.GenerateJSON(d)";
			
				client_code[client_code.length] = "";
				client_code[client_code.length] = "// Convert Text to Memoryblock"
				client_code[client_code.length] = "Dim data As Xojo.Core.MemoryBlock = Xojo.Core.TextEncoding.UTF8.ConvertTextToData(json)";
			}
		} else if(request.urlEncodedBody) {
			body = request.urlEncodedBody;
			if(Object.size(body) > 0) {
				mimeType = "application/x-www-form-urlencoded";
				client_code[client_code.length] = "Dim textArr() As Text";
				for(var propertyName in body) {
					var key = propertyName;
					var value = body[key];
					client_code[client_code.length] = "textArr.Append(\"" + key + ") = " + encodeURIComponent(value) + "\"";
				}
				client_code[client_code.length] = "Dim textData As Text = Text.Join(textArr, \"&\")";
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
				client_code[client_code.length] = "// Put raw data into a Text object";
				client_code[client_code.length] = "Const EOL = &u10";
				client_code[client_code.length] = "Dim textData As Text = \"" + body.replace(replaceQuotes,"\"\"").replace(replaceCRLF, "\" + EOL + \"") + "\"";
				client_code[client_code.length] = "";
				client_code[client_code.length] = "// Convert Text to Memoryblock";
				client_code[client_code.length] = "Dim data As Xojo.Core.MemoryBlock = Xojo.Core.TextEncoding.UTF8.ConvertTextToData(textData)";
			}
		}
		
		if(mimeType) {
			client_code[client_code.length] = "";
			client_code[client_code.length] = "// Assign to the Request's Content";
			client_code[client_code.length] = "mySocket.SetRequestContent(data, \"" + mimeType + "\")";
			client_code[client_code.length] = "";
		}
		client_code[client_code.length] = "// Set the URL";
		client_code[client_code.length] = "Dim url As Text = \"" + request.url + "\"";
		client_code[client_code.length] = ""
		client_code[client_code.length] = "// Send Asynchronous Request"
		client_code[client_code.length] = "mySocket.Send(\"" + request.method + "\", url)";
		return client_code.join("\r");
	}
}

XojoNewCodeGenerator.identifier = "com.xojo.PawExtensions.newHTTPCodeGenerator";

XojoNewCodeGenerator.title = "Xojo New Framework"

XojoNewCodeGenerator.fileExtension = ".xojo_code"

registerCodeGenerator(XojoNewCodeGenerator);

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};