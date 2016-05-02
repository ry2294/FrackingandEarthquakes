-- Function: getwells(text, text)

-- DROP FUNCTION getwells(text, text);

CREATE OR REPLACE FUNCTION getwells(text, text, text, text)
  RETURNS SETOF wells AS
$BODY$
    SELECT * FROM wells 
    WHERE cast($1 as double precision) <= cast(lat as double precision) and
      cast(lat as double precision) <= cast($2 as double precision) and
      cast($3 as double precision) <= cast(lon as double precision) and
      cast(lon as double precision) <= cast($4 as double precision) 
      and NOT exists (select 1 from earthquakes eq 
      where cast($1 as double precision) <= cast(eq.lat as double precision) and
      cast(eq.lat as double precision) <= cast($2 as double precision) and
      cast($3 as double precision) <= cast(eq.lon as double precision) and
      cast(eq.lon as double precision) <= cast($4 as double precision) );
$BODY$
  LANGUAGE sql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION getwells(text, text)
  OWNER TO rakesh891;
