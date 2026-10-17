# Malformed footnote fixture

This chapter intentionally breaks the usual GFM footnote pairing so the
claimed reader fragment id never appears in rendered HTML.

A body reference points at a note that is never defined as a proper
footnote definition.[^claimed-id]

<!--
  Malformed: definition uses a different id and an invalid shape that the
  reader pipeline will not mint as id="user-content-fnref-claimed-id".
-->
[^other-id]: Someone, Jane. *Unrelated Tract*. 1900.
