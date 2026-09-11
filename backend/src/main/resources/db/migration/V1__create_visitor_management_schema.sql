CREATE TABLE locations (
    id UUID PRIMARY KEY,
    company_name VARCHAR(200) NOT NULL,
    street VARCHAR(200) NOT NULL,
    postal_code VARCHAR(32) NOT NULL,
    city VARCHAR(120) NOT NULL,
    country VARCHAR(120) NOT NULL,
    additional_info VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE visits (
    id UUID PRIMARY KEY,
    visitor_name VARCHAR(200) NOT NULL,
    visitor_company VARCHAR(200),
    visit_date DATE NOT NULL,
    purpose VARCHAR(500) NOT NULL,
    host_name VARCHAR(200) NOT NULL,
    contact_info VARCHAR(500),
    status VARCHAR(32) NOT NULL,
    location_id UUID NOT NULL REFERENCES locations (id),
    checked_out_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT visits_status_check CHECK (
        status IN ('REGISTERED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED')
    ),
    CONSTRAINT visits_checkout_state_check CHECK (
        (status = 'CHECKED_OUT' AND checked_out_at IS NOT NULL)
        OR (status <> 'CHECKED_OUT' AND checked_out_at IS NULL)
    )
);

CREATE INDEX visits_visit_date_idx ON visits (visit_date);
CREATE INDEX visits_status_idx ON visits (status);
CREATE INDEX visits_location_id_idx ON visits (location_id);
