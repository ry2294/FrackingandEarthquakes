-- Function: getwells(text, text)

-- DROP FUNCTION getwells(text, text);

CREATE OR REPLACE FUNCTION getwells(
    text,
    text)
  RETURNS SETOF wells AS
$BODY$
    SELECT * FROM wells 
    WHERE acos(sin(cast($1 as double precision)) * sin(cast(lat as double precision)) + 
    cos(cast($1 as double precision)) * cos(cast(lat as double precision)) 
    * cos(cast(lon as double precision) - (cast($2 as double precision)))) * 6371 <= 10;
$BODY$
  LANGUAGE sql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION getwells(text, text)
  OWNER TO rakesh891;
