import Text "mo:core/Text";
import OutCall "http-outcalls/outcall";

actor {
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // URL-encode text for use in query parameter
  func urlEncode(text : Text) : Text {
    var encoded = "";
    for (c in text.chars()) {
      let s = Text.fromChar(c);
      if (s == " ") { encoded #= "%20" }
      else if (s == "!") { encoded #= "%21" }
      else if (s == "\"") { encoded #= "%22" }
      else if (s == "#") { encoded #= "%23" }
      else if (s == "$") { encoded #= "%24" }
      else if (s == "%") { encoded #= "%25" }
      else if (s == "&") { encoded #= "%26" }
      else if (s == "'") { encoded #= "%27" }
      else if (s == "(") { encoded #= "%28" }
      else if (s == ")") { encoded #= "%29" }
      else if (s == "+") { encoded #= "%2B" }
      else if (s == ",") { encoded #= "%2C" }
      else if (s == "/") { encoded #= "%2F" }
      else if (s == ":") { encoded #= "%3A" }
      else if (s == ";") { encoded #= "%3B" }
      else if (s == "=") { encoded #= "%3D" }
      else if (s == "?") { encoded #= "%3F" }
      else if (s == "@") { encoded #= "%40" }
      else if (s == "[") { encoded #= "%5B" }
      else if (s == "]") { encoded #= "%5D" }
      else { encoded #= s };
    };
    encoded
  };

  // Extract the first translated segment from Google Translate JSON response
  // Response format: [[["translated","original",...],...],...]
  func extractGoogleTranslation(json : Text) : ?Text {
    let marker = "[[[\"";
    let parts = json.split(#text marker);
    switch (parts.next()) {
      case null { null };
      case (?_before) {
        switch (parts.next()) {
          case null { null };
          case (?afterMarker) {
            let valueParts = afterMarker.split(#text "\"");
            switch (valueParts.next()) {
              case null { null };
              case (?value) { ?value };
            };
          };
        };
      };
    };
  };

  public shared func translateText(text : Text) : async Text {
    let encoded = urlEncode(text);
    let url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ja&dt=t&q=" # encoded;
    let rawResponse = await OutCall.httpGetRequest(url, [], transform);
    switch (extractGoogleTranslation(rawResponse)) {
      case (?translated) { translated };
      case null { rawResponse };
    };
  };
};
